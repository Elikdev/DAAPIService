import { OrderStatus, OrderCNStatus } from "../../entities/Orders";

// Shipment status to display
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
  static transformOrderResponse(order: any): void {
    order.displayStatusCN = OrderUtility.getDisplayStatusInCN(order.status);
    // order.display_transit_status_cn = OrderUtility.getTransitStatusInCN(order.package_status_code || order.status);
  }

  static getDisplayStatusInCN(orderStatus: string): string | undefined {
    if (OrderUtility.isUnpaidOrder(orderStatus)) {
      return OrderCNStatus.OPEN;
    }
    // Marks as paid when payment finished on client side
    else if (OrderUtility.isPaidOrder(orderStatus)) {
      return OrderCNStatus.PAID;
    // Marks as confirmed when payment confirmed by wechat callback
    } else if (OrderUtility.isToShipOrder(orderStatus)) {
      return OrderCNStatus.CONFIRMED;
    } else if (OrderUtility.isToReceiveOrder(orderStatus)) {
      return OrderCNStatus.SHIPPED;
    } else if (OrderUtility.isCompletedOrder(orderStatus)) {
      return OrderCNStatus.COMPLETED;
    } else if (OrderUtility.isCancelledOrder(orderStatus)) {
      return OrderCNStatus.CANCELLED;
    }
  }

  static isUnpaidOrder(orderStatus: string): boolean {
    return orderStatus === OrderStatus.OPEN;
  }
  static isPaidOrder(orderStatus: string): boolean {
    return orderStatus === OrderStatus.PAID;
  }

  static isToShipOrder(orderStatus: string): boolean {
    return orderStatus === OrderStatus.CONFIRMED;
  }

  static isToReceiveOrder(orderStatus: string): boolean {
    return orderStatus === OrderStatus.SHIPPED;
  }

  static isCompletedOrder(orderStatus: string): boolean {
    return orderStatus === OrderStatus.COMPLETED;
  }

  static isCancelledOrder(orderStatus: string): boolean {
    return orderStatus === OrderStatus.CANCELLED;
  }
}


 