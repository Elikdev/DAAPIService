import { OrderStatus, OrderCNStatus, Orders } from "../../entities/Orders";
import { BadRequestError } from "../../error/badRequestError";

export class OrderUtility {
  static transformOrderResponse(order: any): void {
    order.displayStatusCN = OrderUtility.getDisplayStatusInCN(order.status);
    order.displayCreatedDate = OrderUtility.convertDateTime(order.createdtime);
    // Getting the YYYY-MM-DD HH:MM:SS time
    order.displayUpdatedDate = OrderUtility.convertDateTime(order.updatedtime);
    // Getting the last few digits of ID to display
    order.displayOrderId = order.id.split("-").pop().toUpperCase();
  }

  static convertDateTime(dateString: string): string {
    const isoString = new Date(dateString).toISOString();
    return isoString.replace("T", " ").substring(0, isoString.length - 5);
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
    } else if (OrderUtility.isSettledOrder(orderStatus)) {
      return OrderCNStatus.SETTLED;
    }
  }

  static isUnpaidOrder(orderStatus: string): boolean {
    return orderStatus === OrderStatus.OPEN;
  }

  static isSettledOrder(orderStatus: string): boolean {
    return orderStatus === OrderStatus.SETTLED;
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

  static validateOrderForUpdate(order: Orders): void {
    if (
      this.isCompletedOrder(order.status) ||
      this.isCancelledOrder(order.status)
    ) {
      throw new BadRequestError(
        `Cannot update order in ${order.status} status`,
      );
    }
  }
}
