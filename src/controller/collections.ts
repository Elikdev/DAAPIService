import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus } from "../entities/Items";
import { Collections } from "../entities/Collections";

import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createCollectionSchema, updateCollectionSchema } from "../validator/schemas";
import { getOrderByConditions } from "./helper/orderByHelper";
import { getPaginationLinks, getPaginationParams } from "./helper/paginationHelper";

const DEFAULT_SORT_BY:OrderByCondition = { "createdtime":"DESC" };

export class CollectionsController {

  @HandleError("getCollections")
  static async getCollections(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const collectionRepo = getRepository(Collections);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);

    logger.debug("OrderBy: " + JSON.stringify(orderBy));
    const collections = await collectionRepo
      .createQueryBuilder("collection")
      .where("collection.isSuspended = :isSuspended", { isSuspended: false })
      .andWhere("collection.endTime > :current", {current:  new Date()})
      .orderBy("collection.order", "ASC")
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    res.send({
      data: collections,
      links: getPaginationLinks(req, pageNumber, pageSize)
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
      data: savedItem
    });
  }

  @HandleError("getCollectionItems")
  static async getCollectionItems(req: Request, res: Response): Promise<void> {
    const collectionId = req.params.id;
    const itmesRepo = getRepository(Items);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);


    const items = await itmesRepo
      .createQueryBuilder("items")
      .leftJoin("items.collections", "collections")
      .where("collections.id = :id", { id: collectionId })
      .andWhere("items.status != :status", { status: ListingStatus.SOLD })
      .andWhere("items.status != :status", { status: ListingStatus.DELISTED })
      .select(["items"])
      .orderBy("items.score", "DESC")
      .offset(skipSize)
      .limit(pageSize)
      .getMany();
    
    res.send({
      data: items,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }


   @HandleError("getAllCollectionItems")
  static async getAllCollectionItems(req: Request, res: Response): Promise<void> {
    const collectionRepo = getRepository(Collections);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);

    const items = await collectionRepo.createQueryBuilder("collection").getMany();


    res.send({
      data: items,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }


  @HandleError("removeCollectionItem")
   static async removeCollectionItem(req: Request, res: Response): Promise<void> {
     const collectionId = req.params.id;
     const collectionRepo = getRepository(Collections);
     const collectionData = req.body.data;
     const itemId = collectionData.id;
    
     const collection = await Collections.findOne({id: collectionId}, { relations: ["items"] });
     const toRemoveItem = await Items.findOne({id: itemId});
    
   
     if (!toRemoveItem) {
       throw new ResourceNotFoundError("item not found.");
     }

     if (!collection) {
       throw new ResourceNotFoundError("collection not found.");
     } else {

       const   newItems = collection.items.filter(item => { // this might be slow if collection is large. 
         return item.id !== toRemoveItem.id;
       });
    
       collection.items = newItems;
       const savedItem = await collectionRepo.save(collection);

       res.send({
         data: savedItem
       });
     }
   }

  @HandleError("addCollectionItem")
  static async addCollectionItem(req: Request, res: Response): Promise<void> {
    const collectionId = req.params.id;
    const collectionRepo = getRepository(Collections);
    const collectionData = req.body.data;
    const itemId = collectionData.id;
    
    const collection = await Collections.findOne({id: collectionId}, { relations: ["items"] });
    const item = await Items.findOne({id: itemId});
    
   
    if (!item) {
      throw new ResourceNotFoundError("item not found.");
    }

    if (!collection) {
      throw new ResourceNotFoundError("collection not found.");
    } else {
      collection.items = collection.items.concat(item);
      const savedItem = await collectionRepo.save(collection);
      res.send({
        data: savedItem
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

    const collection = await collectionRepo.findOne({id: collectionId});

    logger.debug(`updating ${JSON.stringify(collection)}`);
    
    if (!collection) {
      throw new ResourceNotFoundError("Collection not found.");
    }


    const result = await collectionRepo.createQueryBuilder()
      .update(Collections, collectionData)
      .where("id = :id", { id: collectionId })
      .returning("*")
      .updateEntity(true)
      .execute()
      .then(response => response.raw[0]);

    res.send({
      data: result
    });
  }  

}