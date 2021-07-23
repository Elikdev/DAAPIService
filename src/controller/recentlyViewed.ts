import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus } from "../entities/Items";
import { RecentlyViewed } from "../entities/RecentlyViewed";
import { Users } from "../entities/Users";
import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { getOrderByConditions } from "./helper/orderByHelper";
import { getPaginationLinks, getPaginationParams } from "./helper/paginationHelper";


export class RecentlyViewedController {

  @HandleError("add")
  static async add(req: Request, res: Response): Promise<void> {
    const data = req.body.data;
    const userId = req.body.userId;
    const recentlyViewedRepo = getRepository(RecentlyViewed);
    const item = await getRepository(Items).findOne({id: data.itemId});
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }
    const user = await getRepository(Users).findOne({id: userId});
    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }

    let recentlyViewedEntity = await recentlyViewedRepo.createQueryBuilder("recentlyViewed")
      .where("recentlyViewed.ownerId = :ownerId", {ownerId: userId })
      .andWhere("recentlyViewed.itemId = :itemId", {itemId: data.itemId })
      .getOne();
    if(recentlyViewedEntity) {
      recentlyViewedEntity.viewdCount += 1
      console.log(recentlyViewedEntity)
      await recentlyViewedRepo.save(recentlyViewedEntity);
    } else {
      let entity :any = new RecentlyViewed()
      entity.item = item
      entity.owner = user
      recentlyViewedEntity = await recentlyViewedRepo.save(entity);
    }

    res.send({
      data: recentlyViewedEntity
    });
  }
  
  @HandleError("get")
  static async get(req: Request, res: Response): Promise<void> {
    const recentlyViewedRepo = getRepository(RecentlyViewed);
    const userId = req.body.userId;
    let recentlyViewed = await recentlyViewedRepo.createQueryBuilder("recentlyViewed")
      .leftJoinAndSelect("recentlyViewed.owner", "user")
      .leftJoinAndSelect("recentlyViewed.item", "item")
      .where("recentlyViewed.ownerId = :ownerId", {ownerId: userId })
      .andWhere("item.status = status", {status:ListingStatus.NEW})
      .orderBy("recentlyViewed.viewdCount", "DESC")
      .getMany();  

    res.send({
      data: recentlyViewed
    });
  }


}


