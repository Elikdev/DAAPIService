import { Router } from "express";
import { authMiddleWare } from "./auth/auth";
import { UserController } from "./controller/user";
import { BuyerAddressController } from "./controller/buyer_address";

export const v1router = Router();

// Do auth filtering
v1router.use(authMiddleWare);

v1router.post("/signup", UserController.signUp);
v1router.post("/signin", UserController.signIn);
v1router.post("/buyer_addresses", BuyerAddressController.createBuyerAddress);

v1router.get("/buyer_addresses/:id", BuyerAddressController.getBuyerAddressById);

v1router.patch("/buyer_addresses/:id", BuyerAddressController.updateBuyerAddress);