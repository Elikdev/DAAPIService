import { Orders, OrderStatus } from "../../entities/Orders";
import { logger } from "../../logging/logger";
import moment from "moment";
import { getRepository } from "typeorm";
import { Items, ListingStatus } from "../../entities/Items";

const ORDER_AUTO_COMPLETE_DAYS = 5;
const ORDER_AUTO_CANCEL_MINUTES = 1;
const UPDATE_MAX = 50; // set limite to avoid hitting max connections

export const autoCompleteOrders = async (): Promise<void> => {
  const orders = await Orders.find({status: OrderStatus.SHIPPED});
  
  let count = 0;
  const results = orders.map(async order => {
    const orderUpdateDate = new Date(order.updatedtime);
    const orderCompleteDate = moment(orderUpdateDate).add(ORDER_AUTO_COMPLETE_DAYS, "d").toDate();
    if (orderCompleteDate < new Date()) {
      order.status = OrderStatus.COMPLETED;
      logger.debug(`Completing order: ${order.id}`);
      count += 1;
      return await order.save();
    }
  });

  await Promise.all(results);
  logger.info(`Finished completing ${count} orders`);
};

export const autoCancelOrders = async (): Promise<void> => {
  const orders = await getRepository(Orders)
    .createQueryBuilder("orders")
    .leftJoinAndSelect("orders.orderItems", "items")
    .where({status: OrderStatus.OPEN})
    .take(UPDATE_MAX)
    .getMany();

  if (orders.length === 0) {
    return; 
  }
  
  let cancelCount = 0;
  const results = orders.map(async order => {
    const orderCreateDate = new Date(order.createdtime);
    const orderCancelTime = moment(orderCreateDate).add(ORDER_AUTO_CANCEL_MINUTES, "m").toDate();
    if (orderCancelTime < new Date()) {
      order.status = OrderStatus.CANCELLED;
      // Relist corresponding items
      await resetItems(order.orderItems);
      logger.debug(`cancel order: ${order.id}`);
      cancelCount += 1;
      return await order.save();
    }
  });

  await Promise.all(results);
  logger.info(`Finished cancelling ${cancelCount} orders.`);
};

export const resetItems = async (items: Items[]): Promise<void> => {
  let relistCount = 0;
  const itemUpdateResults = items.map(async item => {
    // TODO: in order controller: 
    // handle concurrent order placements resulting 
    // in multiple valid/invalid orders containing the same item.
    if (item.status === ListingStatus.SOLD) {
      logger.debug(`relist item: ${item.id}`);
      item.status = ListingStatus.NEW;
      await item.save();
      relistCount += 1;
    }
  });

  logger.info(`Finished relisting ${relistCount} items`);
  await Promise.all(itemUpdateResults);
};
