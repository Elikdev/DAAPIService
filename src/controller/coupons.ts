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
import {
  getPaginationLinks,
  getPaginationParams,
} from "./helper/paginationHelper";

const DEFAULT_SORT_BY: OrderByCondition = { createdtime: "DESC" };

export class CouponsController {
  @HandleError("get")
  static async get(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const shopId = req.query.shopId;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const couponRepo = getRepository(Coupons);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );
    logger.debug("OrderBy: " + JSON.stringify(orderBy));

    const couponQuery = await couponRepo
      .createQueryBuilder("coupon")
      .leftJoinAndSelect("coupon.owner", "owner")
      .leftJoinAndSelect("coupon.shop", "shop")
      .select(["coupon", "owner.id", "owner.username", "shop.name", "shop.id"])
      .skip(skipSize)
      .take(pageSize);

    if (shopId !== undefined && shopId !== "") {
      couponQuery.andWhere("coupon.shopId = :shopId", { shopId: shopId });
    }

    const coupons = await couponQuery.getMany();

    res.send({
      data: coupons,
      links: getPaginationLinks(req, pageNumber, pageSize),
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

    if (ownerId !== undefined && ownerId !== "") {
      const user = await getRepository(Users).findOne({ id: ownerId });
      if (!user) {
        throw new ResourceNotFoundError("User not found.");
      }
      couponData.owner = user;
    }
    if (shopId !== undefined && shopId !== "") {
      const shop = await getRepository(Shops).findOne({ id: shopId });
      if (!shop) {
        throw new ResourceNotFoundError("Shop not found.");
      }
      couponData.shop = shop;
    }

    delete couponData.shopId;
    delete couponData.ownerId;

    const result = await couponRepo
      .createQueryBuilder()
      .update(Coupons, couponData)
      .where("id = :id", { id: couponId })
      .returning("*")
      .updateEntity(true)
      .execute()
      .then((response) => response.raw[0]);

    res.send({
      data: result,
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

    if (ownerId !== undefined && ownerId !== "") {
      const user = await getRepository(Users).findOne({ id: ownerId });
      if (!user) {
        throw new ResourceNotFoundError("User not found.");
      }
      couponData.owner = user;
      delete couponData.ownerId;
    }
    if (shopId !== undefined && shopId !== "") {
      const shop = await getRepository(Shops).findOne({ id: shopId });
      if (!shop) {
        throw new ResourceNotFoundError("Shop not found.");
      }
      couponData.shop = shop;
      delete couponData.shopId;
    }

    const couponEntity = await couponRepo.save(couponData);

    res.send({
      data: couponEntity,
    });
  }

  @HandleError("apply")
  static async apply(req: Request, res: Response): Promise<void> {
    const couponCode = req.query.code;
    const itemShopId = req.query.itemShopId;
    const itemId = req.query.itemId;
    const itemPrice = req.query.itemPrice;
    const userId = req.body.userId;
    const couponRepo = getRepository(Coupons);
    let isValid = false;
    let metaData = {};

    const couponQuery = couponRepo
      .createQueryBuilder("coupons")
      .leftJoinAndSelect("coupons.shop", "shops")
      .leftJoinAndSelect("coupons.collection", "collections")
      .where("coupons.code = :code", { code: couponCode })
      .andWhere("coupons.isValid = :isValid", { isValid: true })
      .andWhere("coupons.expireTime > :time", { time: new Date() });

    if (itemPrice !== undefined && itemPrice !== "") {
      couponQuery.andWhere("coupons.lowestApplicableOrderPrice <= :price", {
        price: itemPrice,
      });
    }

    const couponEntity = await couponQuery.getOne();

    if (couponEntity) {
      if (couponEntity.shop) {
        // Shop Exclusive Coupon
        if (couponEntity.shop.id === itemShopId) {
          const unusedCouponForAccount = await isUnusedCouponForAccount(
            couponEntity.id,
            userId,
          );
          if (unusedCouponForAccount) {
            isValid = couponEntity.isValid;
            metaData = {
              id: couponEntity.id,
              type: couponEntity.couponType,
              value: couponEntity.value,
            };
          }
        } else if (couponEntity.code === "candyneed") {
          // Candyboom 10% off
          const unusedCouponForAccount = await isUnusedCouponForAccount(
            couponEntity.id,
            userId,
          );
          if (unusedCouponForAccount) {
            isValid = couponEntity.isValid;
            metaData = {
              id: couponEntity.id,
              type: couponEntity.couponType,
              value: couponEntity.value,
            };
          }
        }

      } else if (couponEntity.collection) {
        // Collection Items Exclusive Coupon
        const unusedCouponForAccount = await isUnusedCouponForAccount(
          couponEntity.id,
          userId,
        );
        if (unusedCouponForAccount) {
          // Qixi coupon code
          if (couponEntity.code === "qixi777") {
            const validCouponForCollectionItem =
              await isValidCouponForCollectionItem(
                couponEntity.collection.id,
                itemId,
              );
            if (validCouponForCollectionItem) {
              isValid = couponEntity.isValid;
              metaData = {
                id: couponEntity.id,
                type: couponEntity.couponType,
                value: couponEntity.value,
              };
            }
          }
        }
      } else {
        if (couponEntity.code === "first10") {
          const newAccount = await isNewAccount(userId);
          if (newAccount) {
            const value = firstTenCapValue(
              Number(itemPrice),
              couponEntity.value,
            );
            isValid = couponEntity.isValid;
            metaData = {
              id: couponEntity.id,
              type: couponEntity.couponType,
              value: value,
            };
          }
        } else {
          isValid = couponEntity.isValid;
          metaData = {
            id: couponEntity.id,
            type: couponEntity.couponType,
            value: couponEntity.value,
          };
        }
      }
    }

    res.send({
      isValid: isValid,
      metaData: metaData,
    });
  }

  @HandleError("applyForCart")
  static async applyForCart(req: Request, res: Response): Promise<void> {
    const couponData = req.body.data;
    const userId = req.body.userId;
    const couponCode = couponData.code;
    const productsShopId: Array<String> = couponData.productsShopId;
    const productsId: Array<String> = couponData.productsId;
    const totalPrice = couponData.price;
    const couponRepo = getRepository(Coupons);
    let isValid = false;
    let metaData = {};

    const couponQuery = couponRepo
      .createQueryBuilder("coupons")
      .leftJoinAndSelect("coupons.shop", "shops")
      .leftJoinAndSelect("coupons.collection", "collections")
      .leftJoinAndSelect("coupons.shopCollection", "shopCollections")
      .leftJoinAndSelect("coupons.owner", "owner")
      .where("coupons.code = :code", { code: couponCode })
      .andWhere("coupons.isValid = :isValid", { isValid: true })
      .andWhere("coupons.expireTime > :time", { time: new Date() });

    if (totalPrice !== undefined && totalPrice !== "") {
      couponQuery.andWhere("coupons.lowestApplicableOrderPrice <= :price", {
        price: totalPrice,
      });
    }

    const couponEntity = await couponQuery.getOne();

    if (couponEntity) {
      const unusedCouponForAccount = await isUnusedCouponForAccount(
            couponEntity.id,
            userId,
          );

      if (couponEntity.owner && couponEntity.owner.id != userId) {
        // Return false if coupon doesn't belong to this user
        res.send({
          isValid: false,
          metaData: {}
        });    
        return; 
      }

      if (couponEntity.shop) {
        // Shop Exclusive Coupon
        if (unusedCouponForAccount) {
          if (productsShopId.length > 0 && productsShopId.every((shopId) => shopId === couponEntity.shop.id)) {
            isValid = couponEntity.isValid;
            metaData = {
              id: couponEntity.id,
              type: couponEntity.couponType,
              value: couponEntity.value,
            };
          }
        }

      } else if (couponEntity.collection) {
        // Collection Items Exclusive Coupon
        if (unusedCouponForAccount) {
          const booleanResultArray: Boolean[] = await Promise.all(productsId.map(productId => isValidCouponForCollectionItem(couponEntity.collection.id, productId)));
          if (productsId.length > 0 && booleanResultArray.every(v => v === true)) {
            isValid = couponEntity.isValid;
            metaData = {
              id: couponEntity.id,
              type: couponEntity.couponType,
              value: couponEntity.value,
            };
          }
        }
      } else if (couponEntity.shopCollection) {
        // ShopColletion shops exclusive coupon
        const booleanResultArray: Boolean[] = await Promise.all(productsShopId.map(shopId => isValidShopCollectionCouponForShop(couponEntity.shopCollection.id, shopId))); 
        if (productsShopId.length > 0 && booleanResultArray.every(v => v === true)) {
          isValid = couponEntity.isValid;
          metaData = {
            id: couponEntity.id,
            type: couponEntity.couponType,
            value: couponEntity.value,
          };         
        }


      } else {
        if (couponEntity.code === "first10") {
          const newAccount = await isNewAccount(userId);
          if (newAccount) {
            const value = firstTenCapValue(
              Number(totalPrice),
              couponEntity.value,
            );
            isValid = couponEntity.isValid;
            metaData = {
              id: couponEntity.id,
              type: couponEntity.couponType,
              value: value,
            };
          }
        } else {
          isValid = couponEntity.isValid;
          metaData = {
            id: couponEntity.id,
            type: couponEntity.couponType,
            value: couponEntity.value,
          };
        }
      }
    }

    res.send({
      isValid: isValid,
      metaData: metaData,
    });
  }
}


const isValidCouponForCollectionItem = async (
  collectionId: string,
  itemId: any,
): Promise<any> => {
  const itemsRepo = getRepository(Items);
  const item = await itemsRepo
    .createQueryBuilder("items")
    .leftJoinAndSelect("items.collections", "collections")
    .where("collections.id = :id", { id: collectionId })
    .andWhere("collections.isSuspended = :isSuspended", { isSuspended: false })
    .andWhere("collections.endTime > :current", { current: new Date() })
    .andWhere("items.id = :itemId", { itemId: itemId })
    .getOne();

  if (!item) {
    return false;
  }

  return true;
};

const isValidShopCollectionCouponForShop = async (
  shopCollectionId: string,
  shopId: any,
): Promise<any> => {
  const shopsRepo = getRepository(Shops);
  const shop = await shopsRepo
    .createQueryBuilder("shops")
    .leftJoinAndSelect("shops.shopCollections", "shopCollections")
    .where("shopCollections.id = :id", { id: shopCollectionId })
    .andWhere("shopCollections.isSuspended = :isSuspended", { isSuspended: false })
    .andWhere("shopCollections.endTime > :current", { current: new Date() })
    .andWhere("shops.id = :shopId", { shopId: shopId })
    .getOne();

  if (!shop) {
    return false;
  }

  return true;
};

const isUnusedCouponForAccount = async (
  couponId: string,
  ownerId: any,
): Promise<any> => {
  const orderRepo = getRepository(Orders);

  const order = await orderRepo
    .createQueryBuilder("orders")
    .leftJoinAndSelect("orders.buyer", "buyer")
    .leftJoinAndSelect("orders.coupon", "coupon")
    .where("orders.status IN (:...status)", {
      status: [
        OrderStatus.CONFIRMED,
        OrderStatus.SHIPPED,
        OrderStatus.COMPLETED,
        OrderStatus.SETTLED,
      ],
    })
    .andWhere("buyer.id = :ownerId", { ownerId: ownerId })
    .andWhere("coupon.id = :couponId", { couponId: couponId })
    .getMany();

  if (!order || order.length === 0) {
    return true;
  }

  return false;
};

const isNewAccount = async (ownerId: any): Promise<any> => {
  const orderRepo = getRepository(Orders);

  const order = await orderRepo
    .createQueryBuilder("orders")
    .leftJoinAndSelect("orders.buyer", "buyer")
    .where("orders.status IN (:...status)", {
      status: [
        OrderStatus.CONFIRMED,
        OrderStatus.SHIPPED,
        OrderStatus.COMPLETED,
        OrderStatus.SETTLED,
      ],
    })
    .andWhere("buyer.id = :id", { id: ownerId })
    .getMany();

  if (!order || order.length === 0) {
    return true;
  }

  return false;
};

const firstTenCapValue = (itemPrice: number, couponValue: number): number => {
  // Maximum amount off: 50rmb
  return Math.min((50 * 100) / itemPrice, couponValue);
};
