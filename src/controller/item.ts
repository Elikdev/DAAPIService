import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items } from "../entities/Items";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createItemSchema, updateItemSchema } from "../validator/schemas";

export class ItemController {

  @HandleError("createItem")
  static async createItem(req: Request, res: Response): Promise<void> {
    const itemData = req.body.data;
    const validator = new RequestValidator(createItemSchema);
    validator.validate(itemData);
    //TODO: validate shop info.
    const itemRepo = getRepository(Items);

    const savedItem = await itemRepo.save(itemData);
    logger.info("Item created.");
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
                       .where('id = :id', { id: itemId })
                       .returning('*')
                       .updateEntity(true)
                       .execute()
                       .then(response => response.raw[0]);

    res.send({
      data: result
    });
  }  
}