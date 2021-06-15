import { getRepository } from "typeorm";
import { Shops } from "../../entities/Shops";
import { Users } from "../../entities/Users";
import { Addresses } from "../../entities/Addresses";
import { Orders } from "../../entities/Orders";
import { ResourceNotFoundError } from "../../error/notfoundError";
import { logger } from "../../logging/logger";
import { Items } from "../../entities/Items";

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

  const items = await Items.findByIds(orderData.itemIds);
  logger.debug(`purchasing ${JSON.stringify(items)}`);
  if (!items) {
    throw new ResourceNotFoundError("Items not found.");
  }
  orderData.orderItems = items;
  const savedOrder = await getRepository(Orders).save(orderData);
  return savedOrder;
}; 