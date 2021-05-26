import { OrderStatus } from "../../entities/Orders";

// Shipment status to display
const TO_SHIP_STATUS = "待发货";
const TO_RECEIVE_STATUS = "待收货";
const COMPLETED_STATUS = "已完成";
const UNPAID_STATUS = "未付款";
const PAID_STATUS = "已付款";
const STATUS_CODE_TO_DISPLAY_TRANSIT_STATUS_MAP = {
  "PAID" : "已付款，等待处理",
  "CONFIRMED" : "等待卖家发货",
  "SELLER_TO_SHIP" : "等待卖家发货",
  "SELLER_SHIPPED" : "发往熊猫砖仓库",
  "ARRIVED_WH" : "运抵熊猫砖仓库，鉴定中",
  "RELEASE_TO_BUYER" : "已发往国内",
  "COMPLETED" : "已确认收货",
  "CLOSED" : "订单已完成"
};

export class OrderUtility {  
  static transformOrderResponse(order: any) {
    order.displayStatusCN = OrderUtility.getDisplayStatusInCN(order.status);
    // order.display_transit_status_cn = OrderUtility.getTransitStatusInCN(order.package_status_code || order.status);
  }

  static getDisplayStatusInCN(orderStatus: string) {

    if (OrderUtility.isToShipOrder(orderStatus)) {
      return TO_SHIP_STATUS;
    // Marks as paid when payment finished on client side
    } else if (OrderUtility.isPaidOrder(orderStatus)) {
      return PAID_STATUS;
    } else if (OrderUtility.isToReceiveOrder(orderStatus)) {
      return TO_RECEIVE_STATUS;
    } else if (OrderUtility.isCompletedOrder(orderStatus)) {
      return COMPLETED_STATUS;
    } else if (OrderUtility.isUnpaidOrder(orderStatus)) {
      return UNPAID_STATUS;
    }
  }

  static isUnpaidOrder(orderStatus: string) {
    return orderStatus === OrderStatus.OPEN;
  }
  static isPaidOrder(orderStatus: string) {
    return orderStatus === OrderStatus.PAID;
  }

  static isToShipOrder(orderStatus: string) {
    return orderStatus === OrderStatus.CONFIRMED;
  }

  static isToReceiveOrder(orderStatus: string) {
    return orderStatus === OrderStatus.SHIPPED;
  }

  static isCompletedOrder(orderStatus: string) {
    return orderStatus === OrderStatus.COMPLETED;
  }

}


 