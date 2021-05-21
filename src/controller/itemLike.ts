import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items } from "../entities/Items";
import { ItemLikes } from "../entities/ItemLikes";
import { Users } from "../entities/Users";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";

export class ItemLikeController {

  @HandleError("likeItem")
  static async likeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.body.userId;
    const itemId = req.params.id;

    const item = await getRepository(Items).findOne({id: itemId});
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }

    const user = await getRepository(Users).findOne({id: userId});
    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }

    const itemLikeRepo = getRepository(ItemLikes);
    const itemLike = await itemLikeRepo.findOne({user: user, item: item});
    if (itemLike) {
      logger.info("ItemLike already exists.");
      res.send({
        data: itemLike
      });
      return next();
    }
    
    const newItemLike = new ItemLikes();
    newItemLike.user = user;
    newItemLike.item = item;

    const result = await itemLikeRepo.save(newItemLike);
    logger.info("ItemLike created.");
    res.send({
      data: result
    });
  }

  @HandleError("unlikeItem")
  static async unlikeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.body.userId;
    const itemId = req.params.id;

    const item = await getRepository(Items).findOne({id: itemId});
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }

    const user = await getRepository(Users).findOne({id: userId});
    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }

    const itemLikeRepo = getRepository(ItemLikes);
    const itemLike = await itemLikeRepo.findOne({user: user, item: item});
    if (!itemLike) {
      res.send({
        message: "ItemLikeEntry does not exist."
      });
      return next();
    }

    const result = await itemLikeRepo.remove(itemLike);
    res.send({
      message: "ItemLike deleted.",
      data: result
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
      .select(["users.id", "itemLikes.id", "item.id", "item.imageUrls"])
      .getOne();

    res.send({
      data: userLikedItems
    });
  }
}