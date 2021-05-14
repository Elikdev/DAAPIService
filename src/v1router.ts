import { Router } from "express";
import { authMiddleWare } from "./auth/auth";
import { UserController } from "./controller/user";
import { ItemController } from "./controller/item";
import { ItemLikeController } from "./controller/itemLike";
import { ItemSaveController } from "./controller/itemSave";
import { FollowerController } from "./controller/follower";
import { AddressController } from "./controller/address";
import { ShopController } from "./controller/shops";

export const v1router = Router();

v1router.post("/signup", UserController.signUp);
v1router.post("/signin", UserController.signIn);

// Do auth filtering
v1router.use(authMiddleWare);

v1router.post("/items/:id/like", ItemLikeController.createItemLike);
v1router.post("/items/:id/save", ItemSaveController.createItemSave);
v1router.post("/followers/:id/follow", FollowerController.createFollow);
v1router.post("/addresses", AddressController.createAddress);

// GET
v1router.get("/items/:id", ItemController.getItem);
v1router.get("/items", ItemController.getItems);
v1router.get("/addresses", AddressController.getAddresses);

// PATCH
v1router.patch("/items/:id", ItemController.updateItem);
v1router.patch("/addresses/:id", AddressController.updateAddress);

// DELETE
v1router.delete("/addresses/:id", AddressController.deleteAddress);

v1router.post("/shops", ShopController.createShop);
v1router.get("/shops", ShopController.getShops);
v1router.get("/shops/:id/items", ShopController.getShopItems);
v1router.post("/shops/:id/items", ItemController.createItem);
v1router.patch("/shops/:id", ShopController.updateShop);
