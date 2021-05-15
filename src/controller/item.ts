import { Request, Response } from "express";
import { ParsedQs } from "qs";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items } from "../entities/Items";
import { Shops } from "../entities/Shops";
import { Users } from "../entities/Users";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createItemSchema, updateItemSchema } from "../validator/schemas";
import qs from "qs";

const DEFAULT_SORT_BY:OrderByCondition = { "createdtime":"DESC" };
const DEFAULT_PG_SIZE = 10;
const STARTING_PG = 1;

const getOrderByConditions = (sorts: unknown ): OrderByCondition => {
  const condition:OrderByCondition = {};
  if (!sorts) {
    return DEFAULT_SORT_BY;
  }

  if (typeof sorts == "string") {
    sorts.split(",").forEach(sort => {
      const sortTuple = processSort(sort);
      if (sortTuple) {
        condition[sortTuple[0]] = sortTuple[1];
      }
    });
  }
  return condition;
};

const processSort = (sort: string): [string, ("ASC" | "DESC")] | null => {
  if (!sort) {
    return null;
  }
  if (sort.startsWith("-")) {
    return [sort.slice(1), "DESC"];
  } else {
    return [sort, "ASC"];
  }
};

const getLinks = (req: Request, pageNumber: number, pageSize: number): {[columnName: string]: string | null} => {

  const next = getStringifyLink(req.query, pageNumber + 1, pageSize);
  const prev = getStringifyLink(req.query, pageNumber - 1, pageSize);
  const first = getStringifyLink(req.query, STARTING_PG, pageSize);
  
  const resourcePath = req.originalUrl.split("?")[0] + "?";
  const rootPath = req.protocol + "://" + req.get("host");
  return {
    self: rootPath + req.originalUrl,
    first: rootPath + resourcePath + first,
    prev: pageNumber == 1 ? null : rootPath + resourcePath + prev,
    next: rootPath + resourcePath + next,
  };
};

const getStringifyLink = (query:any, pageNumber: number, pageSize: number): string => {
  const pageObject:ParsedQs = { number: pageNumber.toString(), size: pageSize.toString() };
  delete query.page;
  query.page = pageObject;
  return qs.stringify(query, { encode: false });
};

export class ItemController {

  @HandleError("getItems")
  static async getItems(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(sorts);
    const itemRepo = getRepository(Items);

    let pageNumber = STARTING_PG;
    let pageSize = DEFAULT_PG_SIZE;
    if (req.query.page) {
      pageNumber = parseInt((req.query.page as any).number) || 1;
      pageSize =  parseInt((req.query.page as any).size) || DEFAULT_PG_SIZE;
    }
    const skipSize = pageSize * (pageNumber-1);
    
    logger.debug("OrderBy: " + JSON.stringify(orderBy));
    const result = await itemRepo.createQueryBuilder()
      .orderBy(orderBy)
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    res.send({
      data: result,
      links: getLinks(req, pageNumber, pageSize)
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