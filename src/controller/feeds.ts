import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { UserRelations } from "../entities/UserRelations";
import { Items, ListingStatus, AuditStatus } from "../entities/Items";
import { getOrderByConditions } from "./helper/orderByHelper";
import { getPaginationLinks, getPaginationParams } from "./helper/paginationHelper";
import { logger } from "../logging/logger";
const ITEMS_DEFAULT_SORT_BY:OrderByCondition = { "items.updatedtime":"DESC" };

export class FeedsController {

  @HandleError("getFeeds") 
  static async getFeeds(req: Request, res: Response): Promise<void> {
    let feeds: Items[] = [];
    const userId = req.body.userId;
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(sorts, ITEMS_DEFAULT_SORT_BY);
    
    if (userId) { // if loggin, return user following items.
      const userRelationRepo = await getRepository(UserRelations);
      const followings = await userRelationRepo.createQueryBuilder("userRelations")
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

      if (followings.length !== 0) {
        const followingShopIds = getFollowingShopIds(followings);
        feeds = await getRepository(Items)
          .createQueryBuilder("items")
          .leftJoinAndSelect("items.itemLikes", "itemLikes")
          .leftJoinAndSelect("itemLikes.user", "user")
          .leftJoinAndSelect("items.shop", "shops")
          .leftJoinAndSelect("shops.owner", "users")
          .where("items.shopId IN (:...ids)", { ids: followingShopIds })
          .andWhere("shops.isSuspended = :isSuspended", { isSuspended: false })
          .andWhere("items.status = :new", { new: ListingStatus.NEW })
          .andWhere("items.auditStatus = :pass", {pass: AuditStatus.PASS})
          .select(["items", "itemLikes", "user", "shops.name", "shops.id", "shops.introduction", "shops.logoUrl", "shops.customerServiceUrl", "shops.commissionRate","shops.location", "users.id", "users.username"])
          .orderBy(orderBy)
          .skip(skipSize)
          .take(pageSize)
          .getMany();
      }
      feeds.map(function (element: any) {
        const likedUserIds = element.itemLikes.map(function(likes:any) { 
          return likes.user.id;
        });
        element.likedByUser = false;
        if(likedUserIds.includes(userId)) {
          element.likedByUser = true;
        } 
        delete element.itemLikes;
        return element;
      });
    }
    res.send({
      data: feeds,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }
}

const getFollowingShopIds = (followings: UserRelations[]): string[] => {
  let shopIds: string[] = [];
  followings.forEach(
    following => {
      if (following.followee && following.followee.shops) {
        const shops = following.followee.shops;
        const ids = shops.map(shop => shop.id);
        shopIds = shopIds.concat(ids);
      }
    });
  return shopIds;
};