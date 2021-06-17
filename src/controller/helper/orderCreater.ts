import { getRepository } from "typeorm";
import { Shops } from "../../entities/Shops";
import { Users } from "../../entities/Users";
import { Addresses } from "../../entities/Addresses";
import { Orders } from "../../entities/Orders";
import { ResourceNotFoundError } from "../../error/notfoundError";
import { logger } from "../../logging/logger";
import { Items, ListingStatus } from "../../entities/Items";
import { BadRequestError } from "../../error/badRequestError";
import { WxpayService } from "../../payment/wxpayService";
import { Payments } from "../../entities/Payments";
import { BaseError } from "../../error/baseError";
import { DependencyError } from "../../error/dependencyError";

export const createSingleOrder = async (userId: any, orderData: any): Promise<any> => {
  const shopId = orderData.shopId;
  const addressId = orderData.addressId;
  const shop = await Shops.findOne({id: shopId});
  if (!shop) {
    throw new ResourceNotFoundError("Shop not found.");
  }
  const address = await Addresses.findOne({id: addressId});
  if (!address) {
    throw new ResourceNotFoundError("Address not found.");
  }
  const user = await Users.findOne({id: userId});
  orderData.buyer = user;
  orderData.buyerAddress = address;
  orderData.shop = shop;

  const items = await Items.findByIds(orderData.itemIds, { relations: ["shop"] });
  logger.debug(`purchasing ${JSON.stringify(items)}`);
  if (!items) {
    throw new ResourceNotFoundError("Items not found.");
  }
  items.map(item => verifyItem(shopId, item));

  orderData.orderItems = items;
  const savedOrder = await getRepository(Orders).save(orderData);

  await Promise.all(items.map(item => changeItemStatus(item)));
  return savedOrder;
}; 

const verifyItem = (shopId: string, item: Items): void => {
  if (item.status != ListingStatus.NEW) {
    throw new BadRequestError(`item ${item.id} with status=${item.status} is not valid`);
  }
  if (item.shop.id != shopId) {
    throw new BadRequestError(`item ${item.id} is not in shop ${shopId}`);
  }
};

const changeItemStatus = async (item: Items): Promise<void> => {
  item.status = ListingStatus.SOLD;
  await getRepository(Items).save(item);
};

export const payOrder = async (userId: any, orderId: string, totalPrice: number): Promise<any> => {
  const useSandbox = process.env.APP_ENV === "production"? false : true;
  const payService = new WxpayService(useSandbox);
  const user = await Users.findOne({id: userId});
  if (!user) {
    throw new BaseError("user not found");
  }
  const openId = user.openId;
  if (!openId) {
    throw new BaseError("openid not found");
  }
  // TODO: 分账
  const payresult = await payService.prepay(totalPrice, openId, orderId, false);
  if (payresult.xml.return_code != "SUCCESS") {
    throw new DependencyError("Encounter error calling wx prepay api");
  }
  return payresult.xml;
};