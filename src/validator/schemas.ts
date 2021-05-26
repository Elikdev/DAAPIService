import Joi from "joi";
import { ItemCondition, ShippingType } from "../entities/Items";

export const signUpSchema = Joi.object().keys({
  code: Joi.string().required(),
  iv: Joi.string().required(),
  encryptedData: Joi.string().required(),

});

export const createItemSchema = Joi.object().keys({
  name: Joi.string().required(),
  price: Joi.number().required(),
  condition: Joi.number().required().valid(...Object.values(ItemCondition)),
  color: Joi.string().optional(),
  size: Joi.string().required(),
  imageUrls: Joi.array().required(),
  factoryDate: Joi.string(),
  description: Joi.string().required(),
  stock: Joi.number(),
  year: Joi.string(),
  brand: Joi.string(),
  status: Joi.string(),
  origin: Joi.string().optional(),
  category: Joi.string(),
  subcategory: Joi.string().optional(),
  shippingType: Joi.string().required().valid(...Object.values(ShippingType)),
});

export const createOrderSchema = Joi.object().keys({
  totalPrice: Joi.number().required(),
  itemsPrice: Joi.number().required(),
  itemId: Joi.string().uuid().required(),
  processingFee: Joi.number().required(),
  itemImageUrls: Joi.array().required(),
  itemName: Joi.string().required(),
  itemSize: Joi.string().required(),
  trackingNum: Joi.string().optional(),
  shopId: Joi.string().uuid().required(),
  addressId: Joi.string().uuid().required()
});   

export const updateItemSchema = Joi.object().keys({
  name: Joi.string().optional(),
  price: Joi.number().optional(),
  condition: Joi.number().optional().valid(...Object.values(ItemCondition)),
  color: Joi.string().optional(),
  size: Joi.string().optional(),
  imageUrls: Joi.array().optional(),
  factoryDate: Joi.string().optional(),
  description: Joi.string().optional(),
  stock: Joi.number(),
  status: Joi.string().optional(),
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
