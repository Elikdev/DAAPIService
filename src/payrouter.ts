import { Router } from "express";
import { PaymentController } from "./controller/payment";
const bodyParser = require("body-parser");
require("body-parser-xml")(bodyParser);

export const payrouter = Router();

payrouter.use(bodyParser.xml());
payrouter.post("/confirm/wx", PaymentController.confirmWxPay);