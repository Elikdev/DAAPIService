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
import { CollectionsController } from "./controller/collections";
import { ShopCollectionsController } from "./controller/shop_collections";
import { CouponsController } from "./controller/coupons";
import { SearchController } from "./controller/search";
import { RecentlyViewedController } from "./controller/recentlyViewed";
import bodyParser from "body-parser";
import { NotificationController } from "./controller/notification";
import { ShoppingCartController } from "./controller/shoppingCart";
import { ConversationsController } from "./controller/conversation";
import { ReviewsController } from "./controller/review";
import { itemCommentController } from "./controller/itemComment";
import { EventController } from "./controller/event";
import { EventUserStatusController } from "./controller/eventUserStatus";

export const v1router = Router();

v1router.use(bodyParser.json());
v1router.post("/signup", UserController.signUp);
v1router.post("/signin", UserController.signIn);
v1router.put("/users/:id", UserController.updateUser);
v1router.put("/users/:id/deviceInfo", UserController.updateUserDeviceInfo);
v1router.get("/users/:id", UserController.getUser);
v1router.get("/test", NotificationController.test);

v1router.get("/items", ItemController.getItems);
v1router.get("/items/:id", ItemController.getItem);

v1router.get("/shops", ShopController.discoverShops);
v1router.get("/shops/:id/items", ShopController.getShopItems);
v1router.get("/shops/:id", ShopController.getShop);
v1router.get("/collections", CollectionsController.getCollections);
v1router.get(
  "/collections/:id/items",
  CollectionsController.getCollectionItems,
);
v1router.get("/collections/items", CollectionsController.getAllCollectionItems);
v1router.get("/collections/all", CollectionsController.getAllCollections); // admin

v1router.get("/shopCollections", ShopCollectionsController.getShopCollections);
v1router.get(
  "/shopCollections/:id/shops",
  ShopCollectionsController.getShopCollectionShops,
);
v1router.get(
  "/shopCollections/shops",
  ShopCollectionsController.getAllShopCollectionShops,
);
v1router.get(
  "/shopCollections/all",
  ShopCollectionsController.getAllShopCollections,
); // admin

v1router.get("/search", SearchController.search);
v1router.get("/querySug", SearchController.querySuggestion);

v1router.get("/coupons", CouponsController.get); // TODO access control
v1router.put("/coupons/:id", CouponsController.update);
v1router.post("/coupons", CouponsController.create);

v1router.get("/itemComments/:itemId", itemCommentController.getItemComments);

v1router.get("/reviews/:shopId/count", ReviewsController.getShopReviewsCount);

//eventUserStatus
v1router.get(
  "/eventUserStatus/:eventName/:userId/inviteStatus",
  EventUserStatusController.getEventUserStatus,
);

v1router.post(
  "/eventUserStatus/:eventName/:userId/:inviteStatus",
  EventUserStatusController.updateEventUserStatus,
);
v1router.get(
  "/eventUserStatus/:eventName/:inviteCode",
  EventUserStatusController.verifyInviteCode,
);

//events
v1router.get(
  "/events/:eventName/:shopId/items",
  EventController.getShopEventItems,
);

v1router.get("/events", EventController.getEvents);

v1router.get("/events/:eventName/items", EventController.getEventItems);

v1router.get("/events/:eventName", EventController.getEvent);

v1router.post("/events/:eventName/:itemId", EventController.addEventItems);

v1router.delete("/events/:eventName/:itemId", EventController.removeEventItems);

//itemLikes

v1router.get("/itemLikes/:id", ItemLikeController.getItemLikes);

// Do auth filtering for the following apis
v1router.use(authMiddleWare);

v1router.get("/feeds", FeedsController.getFeeds);
v1router.post("/items/:id/like", ItemLikeController.likeItem);
v1router.post("/items/:id/save", ItemSaveController.saveItem);
v1router.post("/items/:id/unlike", ItemLikeController.unlikeItem);
v1router.post("/items/:id/unsave", ItemSaveController.unsaveItem);
v1router.put("/items/:id", ItemController.updateItem);
v1router.get("/discoverItems", ItemController.discoverItems);
v1router.get("/items/:id/suggest", ItemController.getSuggestItems);

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
v1router.post("/shops/:id/items", ItemController.createItem);
v1router.put("/shops/:id", ShopController.updateShop);
v1router.get("/shops/:id/orders", OrderController.getShopOrders);

v1router.post("/orders", OrderController.createOrder);
v1router.get("/orders", OrderController.getBuyerOrders);
v1router.get("/orders/all", OrderController.getAllOrders); // for admin
v1router.get("/orders/:id", OrderController.getOrder);
v1router.put("/orders/:id", OrderController.updateOrder);

v1router.post("/collections", CollectionsController.createCollection);
v1router.put("/collections/:id", CollectionsController.updateCollection);
v1router.put(
  "/collections/:id/items/",
  CollectionsController.addCollectionItem,
);
v1router.delete(
  "/collections/:id/items/",
  CollectionsController.removeCollectionItem,
);

v1router.post(
  "/shopCollections",
  ShopCollectionsController.createShopCollection,
);
v1router.put(
  "/shopCollections/:id",
  ShopCollectionsController.updateShopCollection,
);
v1router.put(
  "/shopCollections/:id/shops/",
  ShopCollectionsController.addShopCollectionItem,
);
v1router.delete(
  "/shopCollections/:id/shops/",
  ShopCollectionsController.removeShopCollectionItem,
);

v1router.get("/cart", ShoppingCartController.getCart);
v1router.post("/cart/:id", ShoppingCartController.addCartItem);
v1router.delete("/cart/:id", ShoppingCartController.removeCartItem);

v1router.get("/coupons/apply", CouponsController.apply);
v1router.post("/coupons/applyForCart", CouponsController.applyForCart);

v1router.post("/recentlyViewed", RecentlyViewedController.add);
v1router.get("/recentlyViewed", RecentlyViewedController.get);

v1router.post("/conversations", ConversationsController.createConversations);
v1router.get("/conversations", ConversationsController.getConversations);
v1router.put("/conversations/:id", ConversationsController.updateConversations);

v1router.post("/reviews", ReviewsController.createReviews);
v1router.get("/reviews/:shopId", ReviewsController.getShopReviews);

v1router.post("/itemComments", itemCommentController.createItemComment);
