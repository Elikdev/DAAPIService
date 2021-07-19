import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus } from "../entities/Items";
import { Coupons } from "../entities/Coupons";
import { Orders, OrderStatus } from "../entities/Orders";
import { Users } from "../entities/Users";
import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createCollectionSchema, updateCollectionSchema } from "../validator/schemas";
import { getOrderByConditions } from "./helper/orderByHelper";
import { getPaginationLinks, getPaginationParams } from "./helper/paginationHelper";

const DEFAULT_SORT_BY:OrderByCondition = { "createdtime":"DESC" };

export class CouponsController {

  @HandleError("apply")
  static async apply(req: Request, res: Response): Promise<void> {
    const couponCode = req.query.code;
    const userId = req.body.userId;
    const couponRepo = getRepository(Coupons);
    let isValid = false;
    let metaData = {};

    if(couponCode === "first10") {
      isValid = await isNewAccount(userId);
      metaData = {  //TODO get this from db. 
        type: "percentOff",
        value: 10
      };
    }

    res.send({
      isValid: isValid,
      metaData: metaData
    });
  }
}


const isNewAccount = async (ownerId: any) : Promise<any> => {
  const orderRepo = getRepository(Orders);

  const order = await orderRepo.createQueryBuilder("orders")
    .leftJoinAndSelect("orders.buyer", "buyer")
    .where("orders.status IN (:...status)", {status: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.COMPLETED, OrderStatus.SETTLED]} )
    .andWhere("buyer.id = :id", {id: ownerId})
    .getMany();
  
  if(!order || order.length === 0) {
    return true;
  }

  return false;
};