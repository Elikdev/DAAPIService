import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus, AuditStatus } from "../entities/Items";
import { Collections } from "../entities/Collections";

import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import {
  createCollectionSchema,
  updateCollectionSchema,
} from "../validator/schemas";
import { getOrderByConditions } from "./helper/orderByHelper";
import {
  getPaginationLinks,
  getPaginationParams,
} from "./helper/paginationHelper";

const DEFAULT_SORT_BY: OrderByCondition = { createdtime: "DESC" };

export class CollectionsController {
  @HandleError("getCollections")
  static async getCollections(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const collectionRepo = getRepository(Collections);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );
    logger.debug("OrderBy: " + JSON.stringify(orderBy));

    const collections = await collectionRepo
      .createQueryBuilder("collection")
      .where("collection.isSuspended = :isSuspended", { isSuspended: false })
      .andWhere("collection.endTime > :current", { current: new Date() })
      .orderBy("collection.order", "ASC")
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    res.send({
      data: collections,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }

  @HandleError("getAllCollections")
  static async getAllCollections(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const collectionRepo = getRepository(Collections);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );
    logger.debug("OrderBy: " + JSON.stringify(orderBy));

    const collections = await collectionRepo
      .createQueryBuilder("collection")
      .orderBy("collection.order", "ASC")
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    res.send({
      data: collections,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }

  @HandleError("createCollection")
  static async createCollection(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const collectionData = req.body.data;
    const validator = new RequestValidator(createCollectionSchema);
    validator.validate(collectionData);

    const collectionRepo = getRepository(Collections);
    const savedItem = await collectionRepo.save(collectionData);
    res.send({
      data: savedItem,
    });
  }

  @HandleError("getCollectionItems")
  static async getCollectionItems(req: Request, res: Response): Promise<void> {
    const collectionId = req.params.id;
    const itmesRepo = getRepository(Items);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );

    const itemsQuery = await itmesRepo
      .createQueryBuilder("items")
      .leftJoin("items.collections", "collections")
      .where("collections.id = :id", { id: collectionId })
      .andWhere("items.status NOT IN (:...status)", {
        status: [ListingStatus.SOLD, ListingStatus.DELISTED],
      })
      .andWhere("items.auditStatus = :pass", { pass: AuditStatus.PASS })
      .select(["items"])
      .orderBy({ "items.updatedtime": "DESC" }) // Get top20 recently updated items
      .offset(skipSize)
      .limit(pageSize);

    const items: Items[] = await itemsQuery.getMany();

    // Sort items by recently (in 72 hours) updated items
    const threeDaysAgo = new Date(new Date().getTime() - 72 * 60 * 60 * 1000);
    const recentlyUpdatedItems: Items[] = await itemsQuery
      .andWhere("items.updatedtime > :time", { time: threeDaysAgo })
      .getMany();

    let resultItems;
    let recentlyUpdatedItemsCount = 0;

    const sortItemsByHeat = (a: Items, b: Items): number => {
      return a.itemLikesCount + a.itemSavesCount <
        b.itemLikesCount + b.itemSavesCount
        ? 1
        : -1;
    };

    if (recentlyUpdatedItems && recentlyUpdatedItems.length > 0) {
      const itemsId = new Set(recentlyUpdatedItems.map((item) => item.id));
      const promotedItems = items.filter((item) => itemsId.has(item.id));
      recentlyUpdatedItemsCount = promotedItems.length;
      // Part1: items updated in 72 hours, Part2: items sort by heat
      const sortedItems = [
        ...promotedItems,
        ...items.filter((item) => !itemsId.has(item.id)).sort(sortItemsByHeat),
      ];
      resultItems = sortedItems;
    } else {
      resultItems = items.sort(sortItemsByHeat);
    }

    res.send({
      data: resultItems,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }

  @HandleError("getAllCollectionItems")
  static async getAllCollectionItems(
    req: Request,
    res: Response,
  ): Promise<void> {
    const collectionRepo = getRepository(Collections);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );

    const items = await collectionRepo
      .createQueryBuilder("collection")
      .getMany();

    res.send({
      data: items,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }

  @HandleError("removeCollectionItem")
  static async removeCollectionItem(
    req: Request,
    res: Response,
  ): Promise<void> {
    const collectionId = req.params.id;
    const collectionRepo = getRepository(Collections);
    const collectionData = req.body.data;
    const itemId = collectionData.id;

    const collection = await Collections.findOne(
      { id: collectionId },
      { relations: ["items"] },
    );
    const toRemoveItem = await Items.findOne({ id: itemId });

    if (!toRemoveItem) {
      throw new ResourceNotFoundError("item not found.");
    }

    if (!collection) {
      throw new ResourceNotFoundError("collection not found.");
    } else {
      const newItems = collection.items.filter((item) => {
        // this might be slow if collection is large.
        return item.id !== toRemoveItem.id;
      });

      collection.items = newItems;
      const savedItem = await collectionRepo.save(collection);

      res.send({
        data: savedItem,
      });
    }
  }

  @HandleError("addCollectionItem")
  static async addCollectionItem(req: Request, res: Response): Promise<void> {
    const collectionId = req.params.id;
    const collectionRepo = getRepository(Collections);
    const collectionData = req.body.data;
    const itemId = collectionData.id;

    const collection = await Collections.findOne(
      { id: collectionId },
      { relations: ["items"] },
    );
    const item = await Items.findOne({ id: itemId });

    if (!item) {
      throw new ResourceNotFoundError("item not found.");
    }

    if (!collection) {
      throw new ResourceNotFoundError("collection not found.");
    } else {
      collection.items = collection.items.concat(item);
      const savedItem = await collectionRepo.save(collection);
      res.send({
        data: savedItem,
      });
    }
  }

  @HandleError("updateCollection")
  static async updateCollection(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const collectionData = req.body.data;
    const validator = new RequestValidator(updateCollectionSchema);
    validator.validate(collectionData);

    const collectionId = req.params.id;
    const collectionRepo = getRepository(Collections);

    const collection = await collectionRepo.findOne({ id: collectionId });

    logger.debug(`updating ${JSON.stringify(collection)}`);

    if (!collection) {
      throw new ResourceNotFoundError("Collection not found.");
    }

    const result = await collectionRepo
      .createQueryBuilder()
      .update(Collections, collectionData)
      .where("id = :id", { id: collectionId })
      .returning("*")
      .updateEntity(true)
      .execute()
      .then((response) => response.raw[0]);

    res.send({
      data: result,
    });
  }
}
