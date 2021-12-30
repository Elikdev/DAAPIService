import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items } from "../entities/Items";
import { ItemLikes } from "../entities/ItemLikes";
import { Users } from "../entities/Users";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { sendPush } from "./helper/umengPushHelper";
import { ListingStatus } from "../entities/Items";

export class ItemLikeController {
  @HandleError("likeItem")
  static async likeItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userId = req.body.userId;
    const itemId = req.params.id;

    const item = await getRepository(Items).findOne(
      { id: itemId },
      { relations: ["shop", "shop.owner"] },
    );
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }

    const user = await getRepository(Users).findOne({ id: userId });
    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }

    const itemLikeRepo = getRepository(ItemLikes);
    const itemLike = await itemLikeRepo.findOne({ user: user, item: item });
    if (itemLike) {
      logger.info("ItemLike already exists.");
      res.send({
        data: itemLike,
      });
      return next();
    }

    const newItemLike = new ItemLikes();
    newItemLike.user = user;
    newItemLike.item = item;

    const result = await itemLikeRepo.save(newItemLike);
    sendPush(
      user.username + "喜欢了你的商品!",
      item.description,
      "",
      item.shop.owner.deviceToken,
    );

    logger.info("ItemLike created.");
    res.send({
      data: result,
    });
  }

  @HandleError("unlikeItem")
  static async unlikeItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userId = req.body.userId;
    const itemId = req.params.id;

    const item = await getRepository(Items).findOne({ id: itemId });
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }

    const user = await getRepository(Users).findOne({ id: userId });
    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }

    const itemLikeRepo = getRepository(ItemLikes);
    const itemLike = await itemLikeRepo.findOne({ user: user, item: item });
    if (!itemLike) {
      res.send({
        message: "ItemLikeEntry does not exist.",
      });
      return next();
    }

    const itemLikeId = itemLike.id;
    const result = await itemLikeRepo.remove(itemLike);

    res.send({
      message: "ItemLike deleted.",
      id: itemLikeId,
    });
  }

  @HandleError("getUserLikedItems")
  static async getUserLikedItems(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const userLikedItems = await getRepository(Users)
      .createQueryBuilder("users")
      .leftJoinAndSelect("users.itemLikes", "itemLikes")
      .leftJoinAndSelect("itemLikes.item", "item")
      .where("users.id = :id", { id: userId })
      .loadRelationCountAndMap("users.itemLikesCount", "users.itemLikes")
      .select([
        "users.id",
        "itemLikes.id",
        "item.id",
        "item.imageUrls",
        "item.status",
      ])
      .getOne();

    res.send({
      data: userLikedItems,
    });
  }

  @HandleError("getItemLikes")
  static async getItemLikes(req: Request, res: Response): Promise<void> {
    const itemId = req.params.id;
    const itemLikeRepo = getRepository(ItemLikes);

    const itemLikes = await itemLikeRepo
      .createQueryBuilder("itemLikes")
      .leftJoinAndSelect("itemLikes.user", "user")
      .leftJoinAndSelect("user.shops", "shops")
      .leftJoinAndSelect("shops.items", "items")
      .where("itemLikes.itemId = :itemId", { itemId: itemId })
      .select(["itemLikes", "user", "shops", "items"])
      .getMany();

    res.send({
      data: itemLikes,
      count: itemLikes.length,
    });
  }
}
