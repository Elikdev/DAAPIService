import { Router } from "express";
import { PaymentController } from "./controller/payment";
const xmlparser = require("express-xml-bodyparser");

export const payrouter = Router();

payrouter.use(xmlparser());
payrouter.post("/confirm/wx", PaymentController.confirmWxPay);