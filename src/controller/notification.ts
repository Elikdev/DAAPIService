import { Request, Response } from "express";
import { HandleError } from "../decorator/errorDecorator";
import { logger } from "../logging/logger";

export class NotificationController {
  @HandleError("test")
  static async test(req: Request, res: Response): Promise<void> {
    logger.debug(`Received notification: ${JSON.stringify(req.query)}`);
    const signature = req.query.signature;
    const timestamp = req.query.timestamp;
    const nonce = req.query.nonce;
    const echostr = req.query.echostr;

    res.send(echostr);
  }
}
