import { Request, Response, NextFunction } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { ResourceNotFoundError } from "../error/notfoundError";
import { Users } from "../entities/Users";
import { UserRelations } from "../entities/UserRelations";
import { Items, ListingStatus } from "../entities/Items";
import { logger } from "../logging/logger";
import { getOrderByConditions } from "./helper/orderByHelper";
import { getPaginationLinks, getPaginationParams } from "./helper/paginationHelper";
const ITEMS_DEFAULT_SORT_BY:OrderByCondition = { "items.updatedtime":"DESC" };

export class FeedsController {

  @HandleError("getFeeds") 
  static async getFeeds(req: Request, res: Response): Promise<void> {
    let feeds: any[] = [];
    const userId = req.body.userId;
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(sorts, ITEMS_DEFAULT_SORT_BY);
    
    if (userId) { // if loggin, return user following items.
      const userRelationRepo = await getRepository(UserRelations);
      const followingShops = await userRelationRepo.createQueryBuilder("userRelations")
        .leftJoinAndSelect("userRelations.follower", "follower")
        .leftJoinAndSelect("userRelations.followee", "followee")
        .leftJoinAndSelect("followee.shops", "shops")
        .where("follower.id = :id", { id: userId })
        .andWhere("followee.role = :role", { role: "seller" })
        .select([
          "userRelations",
          "followee", 
          "shops"
        ])
        .getMany();
      if (followingShops.length !== 0) {
        const followingUserIds = followingShops.map(user => user.followee.shops[0].id); // currently one user can only has one shop, assume every seller has one shop as well. otherwise shops[0].id will throw NPE
        feeds = await getRepository(Items)
          .createQueryBuilder("items")
          .leftJoinAndSelect("items.shop", "shop")
          .leftJoinAndSelect("shop.owner", "users")
          .where("items.shopId IN (:...ids)", { ids: followingUserIds })
          .andWhere("items.status = :new", { new: ListingStatus.NEW })
          .select(["items", "shop.name", "shop.id", "shop.introduction", "shop.logoUrl", "shop.customerServiceUrl", "shop.location", "users.id", "users.username"])
          .orderBy(orderBy)
          .skip(skipSize)
          .take(pageSize)
          .getMany();
      }
    }

    res.send({
      data: feeds,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }
}
