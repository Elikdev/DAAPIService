import { Request, Response } from "express";
import { HandleError } from "../decorator/errorDecorator";
import { OrderStatus } from "../entities/Orders";
import { Payments, PaymentStatus } from "../entities/Payments";
import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";

export class PaymentController {
  @HandleError("confirmWxPay")
  static async confirmWxPay(req: Request, res: Response): Promise<void> {
    logger.debug(`Received payment notification: ${JSON.stringify(req.body)}`);
    try {
      const outTradeNo = req.body.xml.out_trade_no[0];
      const paymentAmount = parseInt(req.body.xml.total_fee[0]);
      const payment = await Payments.findOne(
        { outTradeNo: outTradeNo },
        { relations: ["orders"] },
      );
      if (!payment) {
        throw new ResourceNotFoundError("Payment not found.");
      }
      if (payment.status != PaymentStatus.OPEN) {
        logger.warn("payment already confirmed, returning success.");
      } else {
        if (payment.amount * 100 != paymentAmount) {
          throw new BadRequestError(
            "Cannot confirm payment: amount not correct.",
          );
        }
        payment.status = PaymentStatus.CONFIRMED;
        payment.save();
        await Promise.all(
          payment.orders.map((order) => {
            order.status = OrderStatus.CONFIRMED;
            order.save();
          }),
        );
      }
      res.send(SUCCESS_RESPONSE_STRING);
    } catch (error) {
      logger.error("Encountered problem confirming payment", error);
      res.send(FAILURE_RESPONSE_STRING);
    }
  }
}

const FAILURE_RESPONSE_STRING =
  "<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>";
const SUCCESS_RESPONSE_STRING =
  "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>";
