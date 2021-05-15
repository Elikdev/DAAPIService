import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items } from "../entities/Items";
import { ItemSaves } from "../entities/ItemSaves";
import { Users } from "../entities/Users";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";

export class ItemSaveController {

  @HandleError("createItemSave")
  static async createItemSave(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    const itemSaveRepo = getRepository(ItemSaves);
    const itemSave = await itemSaveRepo.findOne({user: user, item: item});
    if (itemSave) {
      logger.info("ItemSave already exists.");
      res.send({
        data: itemSave
      });
      return next();
    }
    
    const newItemSave = new ItemSaves();
    newItemSave.user = user;
    newItemSave.item = item;

    const result = await itemSaveRepo.save(newItemSave);
    logger.info("ItemSave created.");
    res.send({
      data: result
    });
  }

  @HandleError("getUserSavedItems")
  static async getUserSavedItems(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const userSavedItems = await getRepository(Users)
      .createQueryBuilder("users")
      .leftJoinAndSelect("users.itemSaves", "itemSaves")
      .leftJoinAndSelect("itemSaves.item", "item")
      .where("users.id = :id", { id: userId })
      .getOne();

    res.send({
      data: userSavedItems
    });
  }
}