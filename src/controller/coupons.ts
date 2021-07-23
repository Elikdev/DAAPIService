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
    const itemShopId = req.query.itemShopId;
    const itemPrice = req.query.itemPrice;
    const userId = req.body.userId;
    const couponRepo = getRepository(Coupons);
    let isValid = false;
    let metaData = {};

    const couponQuery = couponRepo.createQueryBuilder("coupons")
      .leftJoinAndSelect("coupons.shop", "shops")
      .where("coupons.code = :code", {code: couponCode })
      .andWhere("coupons.isValid = :isValid", {isValid: true })
      .andWhere("coupons.expireTime > :time", { time: new Date() });

    if(itemPrice !== undefined && itemPrice !== "") {
      couponQuery.andWhere("coupons.lowestApplicableOrderPrice <= :price", { price: itemPrice})
    }  

    const couponEntity = await couponQuery.getOne();

    if (couponEntity) {
      if (couponEntity.shop && couponEntity.shop.id === itemShopId) { // Shop Exclusive Coupon
        const validCouponForAccount = await isValidCouponForAccount(couponEntity.id, userId);
        if (validCouponForAccount) {
          isValid = couponEntity.isValid;
          metaData = {
            id: couponEntity.id,
            type: couponEntity.couponType,
            value: couponEntity.value
          };
        } 
      } else {
        if (couponEntity.code === "first10") {
          const newAccount = await isNewAccount(userId);
          if (newAccount) {
            isValid = couponEntity.isValid;
            metaData = {
              id: couponEntity.id,
              type: couponEntity.couponType,
              value: couponEntity.value
            };
          }
        }
      }
    }

    res.send({
      isValid: isValid,
      metaData: metaData
    });
  }
}

const isValidCouponForAccount = async (couponId: string, ownerId: any) : Promise<any> => {
  const orderRepo = getRepository(Orders);

  const order = await orderRepo.createQueryBuilder("orders")
    .leftJoinAndSelect("orders.buyer", "buyer")
    .leftJoinAndSelect("orders.coupon", "coupon")
    .where("orders.status IN (:...status)", {status: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.COMPLETED, OrderStatus.SETTLED]} )
    .andWhere("buyer.id = :ownerId", {ownerId: ownerId})
    .andWhere("coupon.id = :couponId", {couponId: couponId})
    .getMany();
  
  if(!order || order.length === 0) {
    return true;
  }

  return false;
};

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