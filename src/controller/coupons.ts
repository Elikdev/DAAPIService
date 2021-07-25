import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus } from "../entities/Items";
import { Coupons } from "../entities/Coupons";
import { Orders, OrderStatus } from "../entities/Orders";
import { Users } from "../entities/Users";
import { Shops } from "../entities/Shops";
import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { updateCouponSchema, createCouponSchema } from "../validator/schemas";
import { getOrderByConditions } from "./helper/orderByHelper";
import { getPaginationLinks, getPaginationParams } from "./helper/paginationHelper";

const DEFAULT_SORT_BY:OrderByCondition = { "createdtime":"DESC" };

export class CouponsController {

  @HandleError("get")
  static async get(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const shopId = req.query.shopId;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const couponRepo = getRepository(Coupons);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);
    logger.debug("OrderBy: " + JSON.stringify(orderBy));

    const couponQuery = await couponRepo
      .createQueryBuilder("coupon")
      .leftJoinAndSelect("coupon.owner", "owner")
      .leftJoinAndSelect("coupon.shop", "shop")
       .select([
        "coupon", "owner.id", "owner.username", "shop.name"
      ])
      .skip(skipSize)
      .take(pageSize)


    if(shopId !== undefined && shopId !== "") {  
      couponQuery.andWhere("coupon.shopId = :shopId", {shopId: shopId});
    }

    const coupons = await couponQuery.getMany();

    res.send({
      data: coupons,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }

  @HandleError("update")
  static async update(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const couponData = req.body.data;
    const validator = new RequestValidator(updateCouponSchema);
    validator.validate(couponData);
    const couponId = req.params.id;
    const couponRepo = getRepository(Coupons);
    const ownerId = couponData.ownerId;
    const shopId = couponData.shopId;
    
    if(ownerId !== undefined && ownerId !== "") {
      const user = await getRepository(Users).findOne({id: ownerId});
      if (!user) {
        throw new ResourceNotFoundError("User not found.");
      }
      couponData.owner = user;
      delete couponData.ownerId;

    }
    if(shopId !== undefined && shopId !== "") {
      const shop = await getRepository(Shops).findOne({id: shopId});
      if (!shop) {
        throw new ResourceNotFoundError("Shop not found.");
      }
      couponData.shop = shop;
      delete couponData.shopId;
    }

    const result = await couponRepo.createQueryBuilder()
      .update(Coupons, couponData)
      .where("id = :id", { id: couponId })
      .returning("*")
      .updateEntity(true)
      .execute()
      .then(response => response.raw[0]);

    res.send({
      data: result
    });
  }


  @HandleError("create")
  static async create(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const couponData = req.body.data;
    const validator = new RequestValidator(createCouponSchema);
    validator.validate(couponData);
    const couponRepo = getRepository(Coupons);
    const ownerId = couponData.ownerId;
    const shopId = couponData.shopId;
    
    if(ownerId !== undefined && ownerId !== "") {
      const user = await getRepository(Users).findOne({id: ownerId});
      if (!user) {
        throw new ResourceNotFoundError("User not found.");
      }
      couponData.owner = user;
      delete couponData.ownerId;

    }
    if(shopId !== undefined && shopId !== "") {
      const shop = await getRepository(Shops).findOne({id: shopId});
      if (!shop) {
        throw new ResourceNotFoundError("Shop not found.");
      }
      couponData.shop = shop;
      delete couponData.shopId;
    }

    const couponEntity = await couponRepo.save(couponData);

    res.send({
      data: couponEntity
    });
  }


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
      couponQuery.andWhere("coupons.lowestApplicableOrderPrice <= :price", { price: itemPrice});
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