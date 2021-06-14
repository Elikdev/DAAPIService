import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Shops } from "../entities/Shops";
import { Users } from "../entities/Users";
import { Addresses } from "../entities/Addresses";
import { Orders } from "../entities/Orders";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createOrderSchema } from "../validator/schemas";
import { OrderUtility } from "./helper/orderUtility";
import { Items } from "../entities/Items";

export class OrderController {

  @HandleError("createOrder")
  static async createOrder(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const orderData = req.body.data;
    const validator = new RequestValidator(createOrderSchema);
    validator.validate(orderData);

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
    const item = await Items.findOne({id: orderData.itemId});
    orderData.buyer = user;
    orderData.buyerAddress = address;
    orderData.shop = shop;
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }
    orderData.itemsJson = {
      "id" : orderData.itemId,
      "name": item.name,
      "imageUrls": item.imageUrls,
      "size": item.size,
      "shopName": item.shop
    };

    const savedOrder = await getRepository(Orders).save(orderData);
    res.send({
      data: savedOrder
    });
  }

  @HandleError("getOrder")
  static async getOrder(req: Request, res: Response): Promise<void> {
    const orderId = req.params.id;
    const order = await getRepository(Orders)
      .createQueryBuilder("orders")
      .where("orders.id = :id", { id: orderId })
      .leftJoinAndSelect("orders.buyerAddress", "buyerAddress")
      .getOne();

    OrderUtility.transformOrderResponse(order);  
  
    res.send({
      data: order 
    });
  }

  @HandleError("getBuyerOrders")
  static async getBuyerOrders(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const buyerOrders = await getRepository(Orders)
      .createQueryBuilder("orders")
      .leftJoinAndSelect("orders.buyer", "buyer")
      .where("buyer.id = :id", { id: userId })
      .getMany();

    buyerOrders.forEach(order => OrderUtility.transformOrderResponse(order));  

    res.send({
      data: buyerOrders
    });
  }

  @HandleError("getShopOrders")
  static async getShopOrders(req: Request, res: Response): Promise<void> {
    const shopId = req.params.id;
    const shoprOrders = await getRepository(Orders)
      .createQueryBuilder("orders")
      .leftJoinAndSelect("orders.shop", "shop")
      .where("shop.id = :id", { id: shopId })
      .getMany();

    res.send({
      data: shoprOrders
    });
  }
}