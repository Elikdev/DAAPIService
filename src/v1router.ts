import { Router } from "express";
import { authMiddleWare } from "./auth/auth";
import { UserController } from "./controller/user";
import { ItemController } from "./controller/item";
import { ItemLikeController } from "./controller/itemLike";
import { ItemSaveController } from "./controller/itemSave";
import { UserRelationController } from "./controller/userRelation";
import { AddressController } from "./controller/address";
import { ShopController } from "./controller/shops";
import { OrderController } from "./controller/order";
import { FeedsController } from "./controller/feeds";
import bodyParser from "body-parser";
import { NotificationController } from "./controller/notification";

export const v1router = Router();

v1router.use(bodyParser.json());
v1router.post("/signup", UserController.signUp);
v1router.post("/signin", UserController.signIn);
v1router.put("/users/:id", UserController.updateUser);
v1router.get("/users/:id", UserController.getUser);
v1router.get("/test", NotificationController.test);

// Do auth filtering
v1router.use(authMiddleWare);

v1router.post("/items/:id/like", ItemLikeController.likeItem);
v1router.post("/items/:id/save", ItemSaveController.saveItem);
v1router.post("/items/:id/unlike", ItemLikeController.unlikeItem);
v1router.post("/items/:id/unsave", ItemSaveController.unsaveItem);
v1router.get("/items/:id", ItemController.getItem);
v1router.get("/items", ItemController.getItems);
v1router.put("/items/:id", ItemController.updateItem);

v1router.get("/feeds", FeedsController.getFeeds);


v1router.post("/users/:id/follow", UserRelationController.follow);
v1router.post("/users/:id/unfollow", UserRelationController.unfollow);
v1router.get("/users/:id/isFollowed", UserRelationController.isFollowed);
v1router.get("/users/:id/savedItems", ItemSaveController.getUserSavedItems);
v1router.get("/users/:id/likedItems", ItemLikeController.getUserLikedItems);
v1router.get("/users/:id/followers", UserRelationController.getUserFollowers);
v1router.get("/users/:id/followings", UserRelationController.getUserFollowings);

v1router.post("/addresses", AddressController.createAddress);
v1router.get("/addresses", AddressController.getAddresses);
v1router.put("/addresses/:id", AddressController.updateAddress);
v1router.delete("/addresses/:id", AddressController.deleteAddress);

v1router.post("/shops", ShopController.createShop);
v1router.get("/shops", ShopController.discoverShops);
v1router.get("/shops/:id/items", ShopController.getShopItems);
v1router.post("/shops/:id/items", ItemController.createItem);
v1router.put("/shops/:id", ShopController.updateShop);
v1router.get("/shops/:id", ShopController.getShop);
v1router.get("/shops/:id/orders", OrderController.getShopOrders);

v1router.post("/orders", OrderController.createOrder);
v1router.get("/orders", OrderController.getBuyerOrders);
v1router.get("/orders/:id", OrderController.getOrder);
v1router.put("/orders/:id", OrderController.updateOrder);

