import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus } from "../entities/Items";
import { Shops } from "../entities/Shops";
import { Users } from "../entities/Users";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createItemSchema, updateItemSchema } from "../validator/schemas";
import { getOrderByConditions } from "./helper/orderByHelper";
import { getPaginationLinks, getPaginationParams } from "./helper/paginationHelper";

export class ItemController {

  @HandleError("getItems")
  static async getItems(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(sorts);
    const itemRepo = getRepository(Items);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);

    logger.debug("OrderBy: " + JSON.stringify(orderBy));
    const itemIds = await itemRepo.createQueryBuilder("item")
      .select("item.id")
      .where("item.status = :new", { new: ListingStatus.NEW })
      .orderBy(orderBy)
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    // two query since one query with join will generate invalid query
    const inputIds = itemIds.map(item => item.id);
    const result = await itemRepo
      .createQueryBuilder("item")
      .where("item.id IN (:...ids)", { ids: inputIds })
      .leftJoinAndSelect("item.shop", "shops")
      .leftJoinAndSelect("shops.owner", "users")
      .leftJoinAndSelect("users.defaultAddress", "defaultAddress")
      .select(["item", "shops.name", "shops.introduction", "shops.logoUrl", "users.username", "defaultAddress.city", "defaultAddress.district"])
      .getMany();

    res.send({
      data: result,
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

    const item = await itemRepo.findOne({id: itemId});
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }

    res.send({
      data: item
    });
  }

  @HandleError("updateItem")
  static async updateItem(req: Request, res: Response): Promise<void> {
    const itemData = req.body.data;
    const validator = new RequestValidator(updateItemSchema);
    validator.validate(itemData);

    const itemId = req.params.id;
    const itemRepo = getRepository(Items);

    const item = await itemRepo.findOne({id: itemId});
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
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