import { HandleError } from "../decorator/errorDecorator";
import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { Shops } from "../entities/Shops";
import { Users } from "../entities/Users";
import { BadRequestError } from "../error/badRequestError";
import { RequestValidator } from "../validator/requestValidator";
import { createShopSchema, updateShopSchema } from "../validator/schemas";
import { ResourceNotFoundError } from "../error/notfoundError";
import { ListingStatus, AuditStatus } from "../entities/Items";
import { getOrderByConditions } from "./helper/orderByHelper";
import { getPaginationLinks, getPaginationParams } from "./helper/paginationHelper";

const MAX_OWNED_SHOPS = 1;
const DEFAULT_SORT_BY:OrderByCondition = { "users.followersCount":"DESC" };

export class ShopController {
  @HandleError("createShop")
  static async createShop(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const shopData = req.body.data;
    const validator = new RequestValidator(createShopSchema);
    validator.validate(shopData);
    const shopRepo = getRepository(Shops);
    const user = await Users.findOne({id: userId});
    if (!user) {
      throw new ResourceNotFoundError("User doesn't exist.");
    }
    const ownedShops = await Shops.find({owner: user});
    if (ownedShops.length >= MAX_OWNED_SHOPS) {
      throw new BadRequestError(`No more than ${MAX_OWNED_SHOPS} shops is allowed.`);
    }
    shopData.owner = user;
    const createdShop = await shopRepo.save(shopData);

    res.send({
      data: createdShop
    });
  }

  @HandleError("discoverShops")
  static async discoverShops(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(sorts, DEFAULT_SORT_BY);
    const repo = getRepository(Shops);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);
     
    // Sort shops by followersCount
    const shopsQuery = repo.createQueryBuilder("shops")
      .innerJoin("shops.owner", "users")
      .innerJoin("shops.items", "items")
      .where("shops.isSuspended = :isSuspended", { isSuspended: false })
      .andWhere("items.status = :new", { new: ListingStatus.NEW }) //this will only return shosp that currentluy has new items.
      .select([
        "shops.id", 
        "shops.rating", 
        "shops.name", 
        "shops.createdtime",
        "shops.introduction", 
        "shops.logoUrl", 
        "users.id",
        "users.username", 
        "users.followersCount", 
        "items.id",
        "items.imageUrls"
      ])
      .orderBy(orderBy)
      .skip(skipSize)
      .take(pageSize);

    const shops: Shops[] = await shopsQuery.getMany();

    // Sort shops by recently (in 24 hours) created items
    const oneDayAgo = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
    const recentlyActiveShops: Shops[] = await shopsQuery
      .andWhere("items.createdtime > :time", { time: oneDayAgo })
      .getMany();

    let resultShops;
    let recentlyActiveShopsCount = 0;

    if (recentlyActiveShops && recentlyActiveShops.length > 0) {
      const shopIds = new Set(recentlyActiveShops.map(shop => shop.id));
      // promotedShops = Top 20 followers count & created items in last 24 hours
      const promotedShops = shops.filter(shop => shopIds.has(shop.id));
      recentlyActiveShopsCount = promotedShops.length;
      const sortedShops = [...promotedShops, ...shops.filter(shop => !shopIds.has(shop.id))];
      resultShops = sortedShops;
    } else {
      resultShops = shops;
    }

    res.send({
      data: resultShops,
      recentlyActiveShopsCount: recentlyActiveShopsCount,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }

  @HandleError("getShop")
  static async getShop(req: Request, res: Response): Promise<void> {
    const shopId = req.params.id;
    const shops = await getRepository(Shops)
      .createQueryBuilder("shops")
      .where("shops.id = :id", { id: shopId })
      .leftJoinAndSelect("shops.owner", "users")
      .leftJoinAndSelect("users.defaultAddress", "defaultAddress")
      .select([
        "shops.id", "shops.name", "shops.introduction", "shops.logoUrl", 
        "users.id", "users.username", "users.followersCount", "users.followingsCount", 
        "defaultAddress.city", "defaultAddress.district", "defaultAddress.street"
      ])
      .getOne();
  
    res.send({
      data: shops 
    });
  }

  @HandleError("updateShop")
  static async updateShop(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const shopId = req.params.id;
    const shopData = req.body.data;

    const validator = new RequestValidator(updateShopSchema);
    validator.validate(shopData);

    const shopRepo = await getRepository(Shops);
    const result = await shopRepo.createQueryBuilder()
      .update(Shops, shopData)
      .where("id = :id", { id: shopId })
      .andWhere("ownerId = :userId", {userId: userId})
      .returning("*")
      .updateEntity(true)
      .execute()
      .then(response => response.raw[0]);
    
    if (!result) {
      throw new ResourceNotFoundError("Shop not found.");
    }
    res.send({
      data: result
    });

  }

  @HandleError("getShopItems")
  static async getShopItems(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);
    const shopId = req.params.id;
    const from = req.query.from; // distinguish if the request comes from myprofie or seller dp.
    
    const shopItemsQeury = getRepository(Shops)
      .createQueryBuilder("shops")
      .leftJoinAndSelect("shops.items", "items")
      .where("shops.id = :id", { id: shopId })
      .andWhere("items.status IN (:...status)", {status: [ListingStatus.NEW, ListingStatus.SOLD, ListingStatus.DELISTED]})
      .loadRelationCountAndMap("shops.itemsCount", "shops.items")
      .select(["shops.id", "items"])
      .orderBy("CASE WHEN items.status='new' THEN 0 ELSE 1 END")
      .addOrderBy("items.createdtime", "DESC") 
      .offset(skipSize)
      .limit(pageSize);
    
    if(from === "shopper") {
      shopItemsQeury.andWhere("items.auditStatus IN (:...auditStatus)", {auditStatus: [AuditStatus.PASS, AuditStatus.PENDING]})
    }

    const shopItems = await shopItemsQeury.getOne();

    if(shopItems === undefined) { 
      res.send({
        data: {
          id: shopId,
          items: [],
          itemsCount: 0
        }
      });
    } else {
      res.send({
        data: shopItems,
        links: getPaginationLinks(req, pageNumber, pageSize)
      });
    }
  }
}