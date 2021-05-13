import { Router } from "express";
import { authMiddleWare } from "./auth/auth";
import { UserController } from "./controller/user";
import { ItemController } from "./controller/item";
import { ItemLikeController } from "./controller/itemLike";
import { ItemSaveController } from "./controller/itemSave";
import { FollowerController } from "./controller/follower";

export const v1router = Router();

v1router.post("/signup", UserController.signUp);
v1router.post("/signin", UserController.signIn);

// Do auth filtering
v1router.use(authMiddleWare);

v1router.post("/items", ItemController.createItem);
v1router.post("/items/:id/like", ItemLikeController.createItemLike);
v1router.post("/items/:id/save", ItemSaveController.createItemSave);
v1router.post("/followers/:id/follow", FollowerController.createFollow);

// GET
v1router.get("/items/:id", ItemController.getItem);

// PATCH
v1router.patch("/items/:id", ItemController.updateItem);

