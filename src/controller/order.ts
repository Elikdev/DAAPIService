import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Orders, OrderStatus } from "../entities/Orders";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { batchCreateOrderSchema, buyerUpdateOrderSchema, sellerUpdateOrderSchema } from "../validator/schemas";
import { createSingleOrder } from "./helper/orderCreater";
import { OrderUtility } from "./helper/orderUtility";
import { getOrderByConditions } from "./helper/orderByHelper";
import { Payments } from "../entities/Payments";
import { WxpayService } from "../payment/wxpayService";
import { Shops } from "../entities/Shops";
import { UserRole, Users } from "../entities/Users";
import { ResourceNotFoundError } from "../error/notfoundError";
import { BadRequestError } from "../error/badRequestError";

// By default latest orders first
const DEFAULT_SORT_BY:OrderByCondition = { "orders.createdtime":"DESC" };

export class OrderController {

  @HandleError("createOrders")
  static async createOrder(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const orderDataArray = req.body.data;
    const validator = new RequestValidator(batchCreateOrderSchema);
    validator.validate(orderDataArray);
    let numberOfSaves = 0;
    let totalPrice = 0;
    const results: any[] = await Promise.all(orderDataArray.map(
      async (orderData: any) => {
        const result = await createSingleOrder(userId, orderData);
        numberOfSaves += 1;
        totalPrice += orderData.totalPrice;
        return result;
      }
    ));
    logger.info(`Created ${numberOfSaves} orders in DB.`);

    const payment = new Payments();
    payment.orders = results;
    payment.amount = totalPrice;
    const savedPayment = await payment.save();
    // Always use production because sandbox sucks
    // const useSandbox = process.env.APP_ENV === "production"? false : true;
    const payService = new WxpayService(false);
    const response = await payService.payOrder(userId, savedPayment.id, totalPrice);
    const payResult = payService.generatePayResult(response);

    logger.debug(`Generated pay result: ${JSON.stringify(payResult)}`);
    res.send({
      data: {
        orders: results,
        payResult: payResult,
        paymentId: savedPayment.id,
        totalCount: results.length
      }
    });
  }

  @HandleError("getOrder")
  static async getOrder(req: Request, res: Response): Promise<void> {
    const orderId = req.params.id;
    const order = await getRepository(Orders)
      .createQueryBuilder("orders")
      .where("orders.id = :id", { id: orderId })
      .leftJoinAndSelect("orders.buyerAddress", "buyerAddress")
      .leftJoinAndSelect("orders.orderItems", "item")
      .leftJoinAndSelect("orders.shop", "shop")
      .getOne();

    OrderUtility.transformOrderResponse(order);  
  
    res.send({
      data: order 
    });
  }

  @HandleError("getBuyerOrders")
  static async getBuyerOrders(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(sorts, DEFAULT_SORT_BY, "orders.");
    const buyerOrders = await getRepository(Orders)
      .createQueryBuilder("orders")
      .orderBy(orderBy)
      .leftJoinAndSelect("orders.buyer", "buyer")
      .where("buyer.id = :id", { id: userId })
      .leftJoinAndSelect("orders.shop", "shop")
      .leftJoinAndSelect("orders.orderItems", "item")
      .getMany();

    buyerOrders.forEach(order => OrderUtility.transformOrderResponse(order));  

    res.send({
      data: buyerOrders,
      totalCount: buyerOrders.length
    });
  }

  @HandleError("getShopOrders")
  static async getShopOrders(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const shopId = req.params.id;
    const sorts = req.query.sort;
    const user = await Users.findOne({id: userId});
    const shop = await Shops.findOne({id: shopId, owner: user});
    if (!shop) {
      throw new ResourceNotFoundError("Shop not found for user.");
    }
    const orderBy = getOrderByConditions(sorts, DEFAULT_SORT_BY, "orders.");
    const shopOrders = await getRepository(Orders)
      .createQueryBuilder("orders")
      .leftJoin("orders.shop", "shop")
      .where("shop.id = :id", { id: shopId })
      .leftJoinAndSelect("orders.orderItems", "item")
      .orderBy(orderBy)
      .getMany();

    shopOrders.forEach(order => OrderUtility.transformOrderResponse(order));  

    res.send({
      data: shopOrders,
      totalCount: shopOrders.length
    });
  }

  @HandleError("updateOrder")
  static async updateOrder(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const orderId = req.params.id;

    const user = await Users.findOne({id: userId});
    if (!user) {
      throw new ResourceNotFoundError("User not found");
    }
    console.log(user);
    let order = await Orders.findOne({id: orderId, buyer: user});
    const updateData = req.body.data;
    let validator;

    if (order) {
      // Is buyer order
      validator = new RequestValidator(buyerUpdateOrderSchema);
      validator.validate(updateData);
      OrderUtility.validateOrderForUpdate(order);

      if (updateData.status === OrderStatus.CANCELLED &&
        !OrderUtility.isUnpaidOrder(order.status)) {
        throw new BadRequestError(`Cannot cancel order in ${order.status} status`);
      }
      order.status = updateData.status;

    } else {
      // Check if seller order
      // TODO: more comprehensive check
      order = await Orders.findOne({id: orderId});
      if (!order || user.role != UserRole.SELLER) {
        throw new ResourceNotFoundError("Order not found.");
      }
      validator = new RequestValidator(sellerUpdateOrderSchema);
      validator.validate(updateData);
      OrderUtility.validateOrderForUpdate(order);
      order.trackingNum = updateData.trackingNum;
      if (OrderUtility.isPaidOrder(order.status) ||
        OrderUtility.isToShipOrder(order.status)) {
        order.status = OrderStatus.SHIPPED;
      }
    }
    const result = await getRepository(Orders).save(order);
    res.send({
      data: result
    });
  }

}
