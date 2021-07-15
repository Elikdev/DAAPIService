import { Router } from "express";
import { MessageController } from "./controller/message";
const xmlparser = require("express-xml-bodyparser");

export const messageRouter = Router();

messageRouter.use(xmlparser());
messageRouter.post("/send", MessageController.sendSubscriptionMessage);