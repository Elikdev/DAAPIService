import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Orders } from "../entities/Orders";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { batchCreateOrderSchema } from "../validator/schemas";
import { createSingleOrder } from "./helper/orderCreater";
import { OrderUtility } from "./helper/orderUtility";
import { getOrderByConditions } from "./helper/orderByHelper";
import { Payments } from "../entities/Payments";
import { WxpayService } from "../payment/wxpayService";

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
    const useSandbox = process.env.APP_ENV === "production"? false : true;
    const payService = new WxpayService(useSandbox);
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
    const shopId = req.params.id;
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(sorts, DEFAULT_SORT_BY, "orders.");
    const shopOrders = await getRepository(Orders)
      .createQueryBuilder("orders")
      .leftJoinAndSelect("orders.shop", "shop")
      .where("shop.id = :id", { id: shopId })
      .leftJoinAndSelect("orders.orderItems", "item")
      .orderBy(orderBy)
      .getMany();

    res.send({
      data: shopOrders,
      totalCount: shopOrders.length
    });
  }
}
