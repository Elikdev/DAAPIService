import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus, AuditStatus } from "../entities/Items";
import { Shops } from "../entities/Shops";

import { ShopCollections } from "../entities/ShopCollections";

import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createShopCollectionSchema, updateShopCollectionSchema } from "../validator/schemas";
import { getOrderByConditions } from "./helper/orderByHelper";
import { getPaginationLinks, getPaginationParams } from "./helper/paginationHelper";

const DEFAULT_SORT_BY:OrderByCondition = { "createdtime":"DESC" };

export class ShopCollectionsController {

  @HandleError("getShopCollections")
  static async getShopCollections(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const collectionRepo = getRepository(ShopCollections);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);
    logger.debug("OrderBy: " + JSON.stringify(orderBy));

    const collections = await collectionRepo
      .createQueryBuilder("collection")
      .where("collection.isSuspended = :isSuspended", { isSuspended: false })
      .andWhere("collection.endTime > :current", {current:  new Date()})
      .orderBy("collection.order", "ASC")
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    res.send({
      data: collections,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }


  @HandleError("getAllShopCollections")
  static async getAllShopCollections(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const collectionRepo = getRepository(ShopCollections);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);
    logger.debug("OrderBy: " + JSON.stringify(orderBy));

    const collections = await collectionRepo
      .createQueryBuilder("collection")
      .orderBy("collection.order", "ASC")
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    res.send({
      data: collections,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }

  @HandleError("createShopCollection")
  static async createShopCollection(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const collectionData = req.body.data;
    const validator = new RequestValidator(createShopCollectionSchema);
    validator.validate(collectionData);

    const collectionRepo = getRepository(ShopCollections);
    const savedItem = await collectionRepo.save(collectionData);
    res.send({
      data: savedItem
    });
  }

  @HandleError("getShopCollectionShops")
  static async getShopCollectionShops(req: Request, res: Response): Promise<void> {
    const collectionId = req.params.id;
    const shopsRepo = getRepository(Shops);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);


    const shops = await shopsRepo
      .createQueryBuilder("shops")
      .leftJoin("shops.shopCollections", "shopCollections")
      .leftJoin("shops.owner", "users")
      .leftJoin("shops.items", "items")
      .where("shopCollections.id = :id", { id: collectionId })
      .andWhere("shops.isSuspended = :isSuspended", {isSuspended: false})
      .andWhere("items.status = :new", { new: ListingStatus.NEW })
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
      .skip(skipSize)
      .take(pageSize)
      .getMany();
    
    res.send({
      data: shops,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }


   @HandleError("getAllShopCollectionShops")
  static async getAllShopCollectionShops(req: Request, res: Response): Promise<void> {
    const collectionRepo = getRepository(ShopCollections);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);

    const shops = await collectionRepo.createQueryBuilder("shopCollections").getMany();


    res.send({
      data: shops,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }


  @HandleError("removeShopCollectionItem")
   static async removeShopCollectionItem(req: Request, res: Response): Promise<void> {
     const collectionId = req.params.id;
     const collectionRepo = getRepository(ShopCollections);
     const collectionData = req.body.data;
     const shopId = collectionData.id;
    
     const collection = await ShopCollections.findOne({id: collectionId}, { relations: ["shops"] });
     const toRemoveShop = await Shops.findOne({id: shopId});
    
   
     if (!toRemoveShop) {
       throw new ResourceNotFoundError("shop not found.");
     }

     if (!collection) {
       throw new ResourceNotFoundError("collection not found.");
     } else {

       const   newShops = collection.shops.filter(shop => { // this might be slow if collection is large. 
         return shop.id !== toRemoveShop.id;
       });
    
       collection.shops = newShops;
       const savedCollection = await collectionRepo.save(collection);

       res.send({
         data: savedCollection
       });
     }
   }

  @HandleError("addShopCollectionItem")
  static async addShopCollectionItem(req: Request, res: Response): Promise<void> {
    const collectionId = req.params.id;
    const collectionRepo = getRepository(ShopCollections);
    const collectionData = req.body.data;
    const shopId = collectionData.id;
    
    const collection = await ShopCollections.findOne({id: collectionId}, { relations: ["shops"] });
    const shop = await Shops.findOne({id: shopId});
    
   
    if (!shop) {
      throw new ResourceNotFoundError("shop not found.");
    }

    if (!collection) {
      throw new ResourceNotFoundError("collection not found.");
    } else {
      collection.shops = collection.shops.concat(shop);
      const savedCollection = await collectionRepo.save(collection);
      res.send({
        data: savedCollection
      });
    }
  }

  @HandleError("updateShopCollection")
  static async updateShopCollection(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const collectionData = req.body.data;
    const validator = new RequestValidator(updateShopCollectionSchema);
    validator.validate(collectionData);

    const collectionId = req.params.id;
    const collectionRepo = getRepository(ShopCollections);

    const collection = await collectionRepo.findOne({id: collectionId});

    logger.debug(`updating ${JSON.stringify(collection)}`);
    
    if (!collection) {
      throw new ResourceNotFoundError("Collection not found.");
    }


    const result = await collectionRepo.createQueryBuilder()
      .update(ShopCollections, collectionData)
      .where("id = :id", { id: collectionId })
      .returning("*")
      .updateEntity(true)
      .execute()
      .then(response => response.raw[0]);

    res.send({
      data: result
    });
  }  

}