import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items } from "../entities/Items";
import { ItemLikes } from "../entities/ItemLikes";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";

export class ItemLikeController {

  @HandleError("createItemLike")
  static async createItemLike(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const itemId = req.params.id;

    const item = await getRepository(Items).findOne({id: itemId});
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }

    const itemLikeRepo = getRepository(ItemLikes);

    const itemLike = await itemLikeRepo.findOne({likedBy: userId, item: item});
    if (itemLike) {
      logger.warning("ItemLike already exists.");
    }
    //TODO: Update item meta data
    const newItemLike = new ItemLikes();
    newItemLike.likedBy = userId;
    newItemLike.item = item;

    const result = await itemLikeRepo.save(newItemLike);
    logger.info("ItemLike created.");
    res.send({
      data: result
    });
  }
}