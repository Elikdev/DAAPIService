import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items } from "../entities/Items";
import { ItemSaves } from "../entities/ItemSaves";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";

export class ItemSaveController {

  @HandleError("createItemSave")
  static async createItemSave(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const itemId = req.params.id;

    const item = await getRepository(Items).findOne({id: itemId});
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }

    const itemSaveRepo = getRepository(ItemSaves);

    const itemSave = await itemSaveRepo.findOne({savedBy: userId, item: item});
    if (itemSave) {
      logger.warning("ItemSave already exists.");
    }
    //TODO: Update item meta data
    
    const newItemSave = new ItemSaves();
    newItemSave.savedBy = userId;
    newItemSave.item = item;

    const result = await itemSaveRepo.save(newItemSave);
    logger.info("ItemSave created.");
    res.send({
      data: result
    });
  }
}