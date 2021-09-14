import { getRepository } from "typeorm";
import { Shops } from "../../entities/Shops";
import { Users } from "../../entities/Users";
import { Addresses } from "../../entities/Addresses";
import { Orders } from "../../entities/Orders";
import { ResourceNotFoundError } from "../../error/notfoundError";
import { logger } from "../../logging/logger";
import { Items, ListingStatus } from "../../entities/Items";
import { Coupons } from "../../entities/Coupons";
import { BadRequestError } from "../../error/badRequestError";
import { Carts } from "../../entities/Cart";

export const createSingleOrder = async (
  userId: number,
  orderData: any,
): Promise<any> => {
  const shopId = orderData.shopId;
  const addressId = orderData.addressId;
  const couponId = orderData.couponId;
  const shop = await Shops.findOne({ id: shopId }, { relations: ["owner"] });
  if (!shop) {
    throw new ResourceNotFoundError("Shop not found.");
  }
  if (shop.owner.id === userId) {
    throw new BadRequestError("Cannot purchase own item.");
  }
  const address = await Addresses.findOne({ id: addressId });
  if (!address) {
    throw new ResourceNotFoundError("Address not found.");
  }

  const coupon = await Coupons.findOne({ id: couponId });
  const user = await Users.findOne({ id: userId });

  if (!user) {
    throw new ResourceNotFoundError("User not found.");
  }
  // 清空购物车，目前只支持一次购买所有物品
  await clearUserCart(user);
  orderData.coupon = coupon;
  orderData.buyer = user;
  orderData.buyerAddress = address;
  orderData.shop = shop;

  const items = await Items.findByIds(orderData.itemIds, {
    relations: ["shop"],
  });
  logger.debug(`purchasing ${JSON.stringify(items)}`);
  if (!items) {
    throw new ResourceNotFoundError("Items not found.");
  }
  items.map((item) => verifyItem(shopId, item));

  orderData.orderItems = items;
  const savedOrder = await getRepository(Orders).save(orderData);

  await Promise.all(items.map((item) => changeItemStatus(item)));
  return savedOrder;
};

const verifyItem = (shopId: string, item: Items): void => {
  if (item.status != ListingStatus.NEW) {
    throw new BadRequestError(
      `item ${item.id} with status=${item.status} is not valid`,
    );
  }
  if (item.shop.id != shopId) {
    throw new BadRequestError(`item ${item.id} is not in shop ${shopId}`);
  }
};

const changeItemStatus = async (item: Items): Promise<void> => {
  item.status = ListingStatus.SOLD;
  await getRepository(Items).save(item);
};

const clearUserCart = async (user: Users): Promise<void> => {
  const cartRepo = await getRepository(Carts);
  const cart = await cartRepo.findOne({ owner: user });

  if (!cart) {
    console.error("Cart is not found");
    return;
  }
  cart.items = [];
  await cartRepo.save(cart);
};
