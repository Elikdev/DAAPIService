import { Request, Response } from "express";
import { getRepository, Not, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus } from "../entities/Items";
import { Shops } from "../entities/Shops";
import { Users } from "../entities/Users";
import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createItemSchema, updateItemSchema } from "../validator/schemas";
import { getOrderByConditions } from "./helper/orderByHelper";
import { getPaginationLinks, getPaginationParams } from "./helper/paginationHelper";

const DEFAULT_SORT_BY:OrderByCondition = { "score": "DESC", "createdtime":"DESC" };

export class ItemController {

  @HandleError("getItems")
  static async getItems(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort; 
    const category = req.query.category;
    // TODO: remove front end hardcoded sorting param -id
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const itemRepo = getRepository(Items);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);

    logger.debug("OrderBy: " + JSON.stringify(orderBy));
    const itemsQuery = itemRepo
      .createQueryBuilder("item")
      .innerJoin("item.shop", "shops")
      .where("shops.isSuspended = :isSuspended", { isSuspended: false })
      .andWhere("item.status = :new", { new: ListingStatus.NEW })
      .skip(skipSize)
      .take(pageSize);

    if(category !== undefined && category !== "") {  //TODO schema validation for category
      itemsQuery.andWhere("item.category = :category", {category: category});
    }

    const items = await itemsQuery.getMany();

    res.send({
      data: items,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }

  @HandleError("createItem")
  static async createItem(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const itemData = req.body.data;
    const shopId = req.params.id;
    const validator = new RequestValidator(createItemSchema);
    validator.validate(itemData);
    const user = await Users.findOne({id: userId});
    const shop = await Shops.findOne({id: shopId, owner: user});
    if (!shop) {
      throw new ResourceNotFoundError("Shop not found.");
    }
    const itemRepo = getRepository(Items);
    itemData.shop = shop;
    const savedItem = await itemRepo.save(itemData);
    res.send({
      data: savedItem
    });
  }

  @HandleError("getItem")
  static async getItem(req: Request, res: Response): Promise<void> {
    const itemId = req.params.id;
    const itemRepo = getRepository(Items);

    const item = await itemRepo.createQueryBuilder("item")
      .where("item.id = :id", { id: itemId })
      .leftJoinAndSelect("item.shop", "shops")
      .leftJoinAndSelect("shops.owner", "users")
      .leftJoinAndSelect("users.defaultAddress", "defaultAddress")
      .select([
        "item", "shops.name", "shops.id", "shops.introduction", 
        "shops.logoUrl", "shops.customerServiceUrl", "users.id", "users.username", 
        "users.openId", "users.mobilePrefix", "users.mobile", "defaultAddress.city", "defaultAddress.district"
      ])
      .getOne();

    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }

    res.send({
      data: item
    });
  }

  @HandleError("getSuggestItems")
  static async getSuggestItems(req: Request, res: Response): Promise<void> {
    const itemId = req.params.id;
    const itemRepo = getRepository(Items);

    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);

    const targetItem = await itemRepo.createQueryBuilder("item")
      .where("item.id = :id", { id: itemId })
      .leftJoinAndSelect("item.shop", "shops")
      .getOne();
      
    if (!targetItem) {
      throw new ResourceNotFoundError("Item not found.");
    }
    const query = itemRepo
      .createQueryBuilder("item")
      .where("item.id != :id", {id: itemId})
      .andWhere("item.status = :new", { new: ListingStatus.NEW })
      .skip(skipSize)
      .take(pageSize);

    const category = targetItem.category;
    const subcategory = targetItem.subcategory;

    if(category && subcategory) {  //TODO schema validation for category
      query.andWhere("item.category = :category", { category: category })
        .andWhere("item.subcategory = :subcategory", { subcategory: subcategory });
    }

    const results = await query.getMany();
    
    res.send({
      data: results,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }

  @HandleError("updateItem")
  static async updateItem(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const itemData = req.body.data;
    const validator = new RequestValidator(updateItemSchema);
    validator.validate(itemData);

    const itemId = req.params.id;
    const itemRepo = getRepository(Items);
    itemData.id = itemId
    const item = await itemRepo.findOne({id: itemId}, {relations: ["shop"]});

    logger.debug(`updating ${JSON.stringify(item)}`);
    
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }
    verifyItem(item);
    const user = await Users.findOne({id: userId});
    const shop = await Shops.findOne({id: item.shop.id, owner: user});
    if (!shop) {
      throw new ResourceNotFoundError("Shop not found.");
    }

    const result = await itemRepo.createQueryBuilder()
      .update(Items, itemData)
      .where("id = :id", { id: itemId })
      .returning("*")
      .updateEntity(true)
      .execute()
      .then(response => response.raw[0]);

    res.send({
      data: result
    });
  }  
}

const verifyItem = (item: Items): void => {
  if (item.status == ListingStatus.SOLD) { // only new and delisted items could be updated
    throw new BadRequestError(`item ${item.id} with status=${item.status} is not valid`);
  }
};