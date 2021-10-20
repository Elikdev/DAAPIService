import { Request, Response } from "express";
import { getRepository, Not, OrderByCondition, getManager } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus, AuditStatus } from "../entities/Items";
import { RecentlyViewed } from "../entities/RecentlyViewed";
import { Shops } from "../entities/Shops";
import { Users } from "../entities/Users";
import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createItemSchema, updateItemSchema } from "../validator/schemas";
import { getOrderByConditions } from "./helper/orderByHelper";
import { ShopCollections } from "../entities/ShopCollections";
import * as _ from "lodash";
import { Constants } from "../config/constants";

import {
  getPaginationLinks,
  getPaginationParams,
} from "./helper/paginationHelper";
const DEFAULT_SORT_BY: OrderByCondition = {
  "item.score": "DESC",
  "item.createdtime": "DESC",
};
const ADMIN_USER_ID = 3;

export class ItemController {
  @HandleError("getItems")
  static async getItems(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const category = req.query.category;
    const shopId = req.query.shopId;
    const startDate: any = req.query.startDate;
    const endDate: any = req.query.endDate;
    const auditStatus = req.query.auditStatus;
    const queryStatus = req.query.status;
    // TODO: remove front end hardcoded sorting param -id
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const itemRepo = getRepository(Items);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );
    let status: any = ListingStatus.NEW;
    logger.debug("OrderBy: " + JSON.stringify(orderBy));
    const itemsQuery = itemRepo // TODO filter out suspended shops and items.
      .createQueryBuilder("item")
      .leftJoinAndSelect("item.shop", "shops")
      .select(["item", "shops.name"])
      .orderBy(orderBy)
      .skip(skipSize)
      .take(pageSize);

    if (category !== undefined && category !== "") {
      //TODO schema validation for category
      itemsQuery.andWhere("item.category = :category", { category: category });
    }

    if (auditStatus !== undefined && auditStatus !== "") {
      itemsQuery.andWhere("item.auditStatus = :auditStatus", {
        auditStatus: auditStatus,
      });
    }

    if (shopId !== undefined && shopId !== "") {
      itemsQuery.andWhere("item.shopId = :shopId", { shopId: shopId });
    }

    if (startDate !== undefined && startDate !== "") {
      const today = new Date(startDate);
      let nextDay = new Date(today.getTime() + 86400000);
      if (endDate !== undefined && endDate !== "") {
        nextDay = new Date(endDate);
      }
      itemsQuery.andWhere("item.createdtime  >= :today", { today: today });
      itemsQuery.andWhere("item.createdtime  < :nextDay", { nextDay: nextDay });
    }

    if (queryStatus !== undefined && queryStatus !== "") {
      status = queryStatus;
    }

    itemsQuery.andWhere("item.status = :status", { status: status });
    itemsQuery.andWhere("shops.isSuspended = :isSuspended", {
      isSuspended: false,
    });

    const items = await itemsQuery.getMany();

    res.send({
      data: items,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }

  @HandleError("discoverItems")
  static async discoverItems(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const category: any = req.query.category;
    let recentlyViewed: RecentlyViewed[] = [];
    const userId = req.body.userId;
    // TODO: remove front end hardcoded sorting param -id
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const itemRepo = getRepository(Items);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );
    const collectionRepo = getRepository(ShopCollections);
    const entityManager = getManager(); // you can also get it via getConnection().manager

    //get shops by styles
    const shopsCollections = await collectionRepo
      .createQueryBuilder("shopCollections")
      .leftJoinAndSelect("shopCollections.shops", "shops")
      .andWhere("shops.isSuspended = :isSuspended", {
        isSuspended: false,
      })
      .getMany();
    //randomly select 2 shops from each style collection
    const shopPool: any = [];
    shopsCollections.forEach((shopCollection: any, index: any) => {
      shopPool.push(`${_.sample(shopCollection.shops).id}`); // 随机从shopCollection里面选2个shop, TODO: 如果前端是翻页而不是刷新, 应该用于上一个page同样的shopPool.
      shopPool.push(`${_.sample(shopCollection.shops).id}`);
    });
    console.log(shopPool.map((shop: any) => `'${shop}'`).join(","));
    logger.debug("OrderBy: " + JSON.stringify(orderBy));

    let topCategory: any = "上衣";
    let accessoryCategory: any = "饰品";
    let dressCategory: any = "裙";

    if (category !== undefined && category !== "") {
      topCategory = category;
      accessoryCategory = category;
      dressCategory = category;
    }
    // The following query will select 1 items for each shop to avoid the case such that all 10 tops are from one shop.
    const itemIdsForTop = await entityManager.query(`SELECT id FROM 
      (SELECT *, ROW_NUMBER() OVER (PARTITION BY "shopId" ORDER BY "score" DESC) 
      AS order_in_grp FROM items WHERE items."category" = '${topCategory}'
      AND items."status" = '${ListingStatus.NEW}'  
      AND items."auditStatus" IN ('pass', 'pending')
      AND items."shopId"  IN (${shopPool
        .map((shop: any) => `'${shop}'`)
        .join(",")})
      OFFSET ${skipSize}) 
      AS A 
      WHERE order_in_grp < 2
      LIMIT ${Constants.TOPSDISTRIBUTIONSIZEFORFEEDS}`); //根据平台卖出比例选择返回商品种类，https://ft4910ylw7.feishu.cn/docs/doccn3iZnCse5hlGs1Z8Tr5aPey#

    const itemIdsForAccessories = await entityManager.query(`SELECT id FROM
      (SELECT *, ROW_NUMBER() OVER (PARTITION BY "shopId" ORDER BY "score" DESC) 
      AS order_in_grp FROM items WHERE items."category" = '${accessoryCategory}'
      AND items."status" = '${ListingStatus.NEW}'  
      AND items."auditStatus" IN ('pass', 'pending')
      AND items."shopId"  IN (${shopPool
        .map((shop: any) => `'${shop}'`)
        .join(",")})
      OFFSET ${skipSize}) 
      AS A 
      WHERE order_in_grp < 2
      LIMIT ${Constants.ACCESSORIESDISTRIBUTIONSIZEFORFEEDS}`);

    const itemIdsForDress = await entityManager.query(`SELECT id FROM
      (SELECT *, ROW_NUMBER() OVER (PARTITION BY "shopId" ORDER BY "score" DESC) 
      AS order_in_grp FROM items WHERE items."category" = '${dressCategory}'
      AND items."status" = '${ListingStatus.NEW}'  
      AND items."auditStatus" IN ('pass', 'pending')
      AND items."shopId"  IN (${shopPool
        .map((shop: any) => `'${shop}'`)
        .join(",")})
      OFFSET ${skipSize}) 
      AS A 
      WHERE order_in_grp < 2
      LIMIT ${Constants.DRESSDISTRIBUTIONSIZEFORFEEDS}`);

    const itemsQueryForTop = itemRepo
      .createQueryBuilder("item")
      .leftJoin("item.shop", "shops")
      .leftJoinAndSelect("item.itemLikes", "itemLikes")
      .leftJoinAndSelect("itemLikes.user", "user")
      .where("item.id IN (:...itemIds)", {
        itemIds: itemIdsForTop.map((item: any) => item.id),
      });

    const itemsQueryForAccessories = itemRepo
      .createQueryBuilder("item")
      .leftJoin("item.shop", "shops")
      .leftJoinAndSelect("item.itemLikes", "itemLikes")
      .leftJoinAndSelect("itemLikes.user", "user")
      .where("item.id IN (:...itemIds)", {
        itemIds: itemIdsForAccessories.map((item: any) => item.id),
      });

    const itemsQueryForDress = itemRepo
      .createQueryBuilder("item")
      .leftJoin("item.shop", "shops")
      .leftJoinAndSelect("item.itemLikes", "itemLikes")
      .leftJoinAndSelect("itemLikes.user", "user")
      .where("item.id IN (:...itemIds)", {
        itemIds: itemIdsForDress.map((item: any) => item.id),
      });

    if (userId && (category === undefined || category === "")) {
      // no recently viewed insertion for collecton items.
      const sevenDayAgo = new Date(
        new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
      );
      const recentlyViewedRepo = getRepository(RecentlyViewed);
      recentlyViewed = await recentlyViewedRepo
        .createQueryBuilder("recentlyViewed")
        .leftJoinAndSelect("recentlyViewed.owner", "user")
        .leftJoinAndSelect("recentlyViewed.item", "item")
        .where("recentlyViewed.ownerId = :ownerId", { ownerId: userId })
        .andWhere("recentlyViewed.createdtime > :time", { time: sevenDayAgo })
        .andWhere("item.status = :status", { status: ListingStatus.NEW })
        .orderBy("recentlyViewed.viewdCount", "DESC")
        .take(2)
        .getMany();

      if (recentlyViewed.length > 0) {
        const recentlyViewedItemsId = recentlyViewed.map(
          (element) => element.item.id,
        );
        itemsQueryForTop.andWhere(
          "item.id NOT IN (:...recentlyViewedItemsId)",
          {
            recentlyViewedItemsId: recentlyViewedItemsId,
          },
        );
        itemsQueryForAccessories.andWhere(
          "item.id NOT IN (:...recentlyViewedItemsId)",
          {
            recentlyViewedItemsId: recentlyViewedItemsId,
          },
        );
        itemsQueryForDress.andWhere(
          "item.id NOT IN (:...recentlyViewedItemsId)",
          {
            recentlyViewedItemsId: recentlyViewedItemsId,
          },
        );
      }
    }

    let topItems: Items[] = [];
    let accessoryItems: Items[] = [];
    let dressItems: Items[] = [];
    if (itemIdsForTop.length > 0) {
      topItems = await itemsQueryForTop.getMany(); // otherwise where IN [] will throw exception
    }
    if (itemIdsForAccessories.length > 0) {
      accessoryItems = await itemsQueryForAccessories.getMany();
    }
    if (itemIdsForDress.length > 0) {
      dressItems = await itemsQueryForDress.getMany();
    }

    let discoverItems: any = [];
    discoverItems = topItems.concat(accessoryItems, dressItems);
    discoverItems = _.shuffle(discoverItems);

    if (userId) {
      //check if items liked by requester
      discoverItems.map(function (element: any) {
        const likedUserIds = element.itemLikes.map(function (likes: any) {
          return likes.user.id;
        });
        element.likedByUser = false;
        if (likedUserIds.includes(userId)) {
          element.likedByUser = true;
        }
        delete element.itemLikes;
        return element;
      });
    }

    let insertIndex = 0;

    if (pageNumber === 1) {
      // insert two recently viewed items to discoverItems only to page 1.
      recentlyViewed.forEach((recentlyViewed: any, index: any) => {
        discoverItems.splice(insertIndex, 0, recentlyViewed.item);
        insertIndex = 2;
      });
    }

    res.send({
      data: discoverItems,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }

  @HandleError("createItem")
  static async createItem(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const itemData = req.body.data;
    const shopId = req.params.id;
    const validator = new RequestValidator(createItemSchema);
    validator.validate(itemData);
    const user = await Users.findOne({ id: userId });
    const shop = await Shops.findOne({ id: shopId, owner: user });
    if (!shop) {
      throw new ResourceNotFoundError("Shop not found.");
    }
    const itemRepo = getRepository(Items);
    itemData.shop = shop;
    const savedItem = await itemRepo.save(itemData);
    res.send({
      data: savedItem,
    });
  }

  @HandleError("getItem")
  static async getItem(req: Request, res: Response): Promise<void> {
    const itemId = req.params.id;
    const itemRepo = getRepository(Items);

    const item = await itemRepo
      .createQueryBuilder("item")
      .where("item.id = :id", { id: itemId })
      .leftJoinAndSelect("item.shop", "shops")
      .leftJoinAndSelect("shops.owner", "users")
      .leftJoinAndSelect("users.defaultAddress", "defaultAddress")
      .select([
        "item",
        "shops.name",
        "shops.id",
        "shops.introduction",
        "shops.logoUrl",
        "shops.customerServiceUrl",
        "shops.commissionRate",
        "users.id",
        "users.username",
        "users.openId",
        "users.avatarUrl",
        "users.mobilePrefix",
        "users.mobile",
        "defaultAddress.city",
        "defaultAddress.district",
      ])
      .getOne();

    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }

    res.send({
      data: item,
    });
  }

  @HandleError("getSuggestItems")
  static async getSuggestItems(req: Request, res: Response): Promise<void> {
    const itemId = req.params.id;
    const itemRepo = getRepository(Items);
    const userId = req.body.userId;

    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );

    const targetItem = await itemRepo
      .createQueryBuilder("item")
      .where("item.id = :id", { id: itemId })
      .leftJoinAndSelect("item.shop", "shops")
      .getOne();

    if (!targetItem) {
      throw new ResourceNotFoundError("Item not found.");
    }
    const query = itemRepo
      .createQueryBuilder("item")
      .leftJoin("item.shop", "shops")
      .leftJoinAndSelect("item.itemLikes", "itemLikes")
      .leftJoinAndSelect("itemLikes.user", "user")
      .where("item.id != :id", { id: itemId })
      .andWhere("item.status = :new", { new: ListingStatus.NEW })
      .andWhere("shops.isSuspended = :isSuspended", { isSuspended: false })
      .andWhere("item.auditStatus IN (:...auditStatus)", {
        auditStatus: [AuditStatus.PENDING, AuditStatus.PASS],
      })
      .skip(skipSize)
      .take(pageSize);

    const category = targetItem.category;
    const subcategory = targetItem.subcategory;

    if (category && subcategory) {
      //TODO schema validation for category
      query
        .andWhere("item.category = :category", { category: category })
        .andWhere("item.subcategory = :subcategory", {
          subcategory: subcategory,
        });
    }

    const results = await query.getMany();

    if (userId) {
      //check if items liked by requester
      results.map(function (element: any) {
        const likedUserIds = element.itemLikes.map(function (likes: any) {
          return likes.user.id;
        });
        element.likedByUser = false;
        if (likedUserIds.includes(userId)) {
          element.likedByUser = true;
        }
        delete element.itemLikes;
        return element;
      });
    }

    res.send({
      data: results,
      links: getPaginationLinks(req, pageNumber, pageSize),
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
    itemData.id = itemId;
    const item = await itemRepo.findOne(
      { id: itemId },
      { relations: ["shop"] },
    );

    logger.debug(`updating ${JSON.stringify(item)}`);

    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }
    verifyItem(item);
    const user = await Users.findOne({ id: userId });

    if (userId !== ADMIN_USER_ID) {
      // TEMP SOLN skip ownership verification for admin.
      const shop = await Shops.findOne({ id: item.shop.id, owner: user });
      if (!shop) {
        throw new ResourceNotFoundError("Shop not found.");
      }
    }

    const result = await itemRepo
      .createQueryBuilder()
      .update(Items, itemData)
      .where("id = :id", { id: itemId })
      .returning("*")
      .updateEntity(true)
      .execute()
      .then((response) => response.raw[0]);

    res.send({
      data: result,
    });
  }
}

const verifyItem = (item: Items): void => {
  if (item.status == ListingStatus.SOLD) {
    // only new and delisted items could be updated
    throw new BadRequestError(
      `item ${item.id} with status=${item.status} is not valid`,
    );
  }
};
