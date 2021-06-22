import Joi from "joi";
import { ItemCondition, ShippingType } from "../entities/Items";
import { OrderStatus } from "../entities/Orders";

export const signUpSchema = Joi.object().keys({
  code: Joi.string().required(),
  iv: Joi.string().required(),
  encryptedData: Joi.string().required(),
});

export const createItemSchema = Joi.object().keys({
  name: Joi.string(),
  price: Joi.number().required(),
  condition: Joi.number().required().valid(...Object.values(ItemCondition)),
  color: Joi.string().optional(),
  size: Joi.string().required(),
  imageUrls: Joi.array().required(),
  description: Joi.string().required(),
  stock: Joi.number(),
  year: Joi.string(),
  brand: Joi.string(),
  origin: Joi.string().optional(),
  category: Joi.string(),
  subcategory: Joi.string().optional(),
  shippingType: Joi.string().required().valid(...Object.values(ShippingType)),
});

export const createOrderSchema = Joi.object().keys({
  totalPrice: Joi.number().required(),
  itemsPrice: Joi.number().required(),
  itemIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  processingFee: Joi.number().optional(),
  trackingNum: Joi.string().optional(),
  shopId: Joi.string().uuid().required(),
  addressId: Joi.string().uuid().required()
});

export const batchCreateOrderSchema = Joi.array().items(createOrderSchema).min(1).required();

export const buyerUpdateOrderSchema = Joi.object().keys({
  status: Joi.string().required().valid(...Object.values([OrderStatus.CANCELLED, OrderStatus.COMPLETED])),
}).min(1);

export const sellerUpdateOrderSchema = Joi.object().keys({
  trackingNum: Joi.string().required(),
}).min(1);

export const updateItemSchema = Joi.object().keys({
  name: Joi.string().optional(),
  price: Joi.number().optional(),
  condition: Joi.number().optional().valid(...Object.values(ItemCondition)),
  color: Joi.string().optional(),
  size: Joi.string().optional(),
  imageUrls: Joi.array().optional(),
  status: Joi.string().optional(),
  factoryDate: Joi.string().optional(),
  description: Joi.string().optional(),
  stock: Joi.number().optional(),
  orderId: Joi.string().optional(),
  brand: Joi.string().optional(),
  origin: Joi.string().optional(),
  category: Joi.string().optional(),
  subcategory: Joi.string().optional()
});

export const createAddressSchema = Joi.object().keys({
  fullName: Joi.string().required(),
  province: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  street: Joi.string().required(),
  phoneNumber: Joi.string().pattern(/^[0-9]+$/).required(),
  isDefault: Joi.boolean().optional()
});

export const updateAddressSchema = Joi.object().keys({
  fullName: Joi.string().optional(),
  province: Joi.string().optional(),
  city: Joi.string().optional(),
  district: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
  street: Joi.string().optional(),
  isDefault: Joi.boolean().optional(),
  isDefaultBeforeUpdate: Joi.boolean().optional()
}).min(1);

export const createShopSchema = Joi.object().keys({
  name: Joi.string().max(20).required(),
  introduction: Joi.string().max(500),
  logoUrl: Joi.string(),
  location: Joi.string().optional()
});

export const updateUserSchema = Joi.object().keys({
  username: Joi.string().max(20),
  introduction: Joi.string().max(500),
  avatarUrl: Joi.string().max(500)

});


export const updateShopSchema = Joi.object().keys({
  name: Joi.string().max(20),
  introduction: Joi.string().max(500),
  addressId: Joi.string().uuid(),
  logoUrl: Joi.string(),
  location: Joi.string().max(500)
});
