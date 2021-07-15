import { Router } from "express";
import { MessageController } from "./controller/message";
import bodyParser from "body-parser";

export const messageRouter = Router();

messageRouter.use(bodyParser.json());
messageRouter.post("/send", MessageController.sendSubscriptionMessage);