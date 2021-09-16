import Joi from "joi";
import {
  ItemCondition,
  ShippingType,
  AuditStatus,
  AuditReasonCode,
} from "../entities/Items";
import { CouponType } from "../entities/Coupons";

import { OrderStatus } from "../entities/Orders";

export const signUpSchema = Joi.object().keys({
  code: Joi.string().required(),
  iv: Joi.string().required(),
  encryptedData: Joi.string().required(),
});

export const appSignUpSchema = Joi.object().keys({
  code: Joi.string().required(),
  platform: Joi.string().required(),
});

export const createItemSchema = Joi.object().keys({
  name: Joi.string(),
  price: Joi.number().required(),
  condition: Joi.number()
    .required()
    .valid(...Object.values(ItemCondition)),
  color: Joi.string().optional(),
  size: Joi.string().required(),
  imageUrls: Joi.array().required(),
  description: Joi.string().required(),
  stock: Joi.number(),
  year: Joi.string(),
  brand: Joi.string().allow("").allow(null).optional(),
  origin: Joi.string().optional(),
  category: Joi.string(),
  subcategory: Joi.string().optional(),
  shippingType: Joi.string()
    .required()
    .valid(...Object.values(ShippingType)),
});

export const createOrderSchema = Joi.object().keys({
  totalPrice: Joi.number().required(),
  itemsPrice: Joi.number().required(),
  itemIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  processingFee: Joi.number().optional(),
  trackingNum: Joi.string().optional(),
  shopId: Joi.string().uuid().required(),
  addressId: Joi.string().uuid().required(),
  orderNotes: Joi.string().allow("").optional(),
  couponId: Joi.string().uuid().allow(null).optional(),
});

export const batchCreateOrderSchema = Joi.array()
  .items(createOrderSchema)
  .min(1)
  .required();

export const buyerUpdateOrderSchema = Joi.object()
  .keys({
    status: Joi.string()
      .required()
      .valid(...Object.values([OrderStatus.CANCELLED, OrderStatus.COMPLETED])),
  })
  .min(1);

export const sellerUpdateOrderSchema = Joi.object()
  .keys({
    trackingNum: Joi.string().required(),
  })
  .min(1);

export const updateItemSchema = Joi.object().keys({
  name: Joi.string().allow("").allow(null).optional(),
  price: Joi.number().optional(),
  condition: Joi.number()
    .optional()
    .valid(...Object.values(ItemCondition)),
  color: Joi.string().allow("").allow(null).optional(),
  size: Joi.string().optional(),
  imageUrls: Joi.array().optional(),
  status: Joi.string().optional(),
  factoryDate: Joi.string().optional(),
  year: Joi.string().optional(),
  description: Joi.string().optional(),
  stock: Joi.number().optional(),
  orderId: Joi.string().optional(),
  brand: Joi.string().allow("").allow(null).optional(),
  origin: Joi.string().allow("").allow(null).optional(),
  category: Joi.string().optional(),
  subcategory: Joi.string().optional(),
  auditStatus: Joi.number()
    .optional()
    .valid(...Object.values(AuditStatus)),
  score: Joi.number(),
  shippingType: Joi.string()
    .optional()
    .valid(...Object.values(ShippingType)),
  auditReasonCode: Joi.string()
    .optional()
    .valid(...Object.values(AuditReasonCode)),
});

export const createAddressSchema = Joi.object().keys({
  fullName: Joi.string().required(),
  province: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  street: Joi.string().required(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .required(),
  isDefault: Joi.boolean().optional(),
});

export const updateAddressSchema = Joi.object()
  .keys({
    fullName: Joi.string().optional(),
    province: Joi.string().optional(),
    city: Joi.string().optional(),
    district: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    street: Joi.string().optional(),
    isDefault: Joi.boolean().optional(),
    isDefaultBeforeUpdate: Joi.boolean().optional(),
  })
  .min(1);

export const createShopSchema = Joi.object().keys({
  name: Joi.string().max(100).required(),
  introduction: Joi.string().max(500),
  logoUrl: Joi.string(),
  location: Joi.string().optional(),
});

export const createCollectionSchema = Joi.object().keys({
  name: Joi.string().max(100).required(),
  endTime: Joi.string().max(100).required(),
});

export const createShopCollectionSchema = Joi.object().keys({
  name: Joi.string().max(100).required(),
  endTime: Joi.string().max(100).required(),
  coverImageUrl: Joi.string().max(200).required(),
});

export const updateCollectionSchema = Joi.object().keys({
  name: Joi.string().max(100).optional(),
  endTime: Joi.string().max(100).optional(),
  isSuspended: Joi.boolean().optional(),
  order: Joi.number().optional(),
});

export const updateShopCollectionSchema = Joi.object().keys({
  name: Joi.string().max(100).optional(),
  endTime: Joi.string().max(100).optional(),
  isSuspended: Joi.boolean().optional(),
  order: Joi.number().optional(),
  coverImageUrl: Joi.string().max(200).optional(),
});

export const updateCouponSchema = Joi.object().keys({
  code: Joi.string().max(100).optional(),
  expireTime: Joi.string().max(100).optional(),
  applied: Joi.boolean().optional(),
  isValid: Joi.boolean().optional(),
  ownerId: Joi.number().optional(),
  couponType: Joi.string()
    .optional()
    .valid(...Object.values(CouponType)),
  value: Joi.number().optional(),
  lowestApplicableOrderPrice: Joi.number().optional(),
  shopId: Joi.string().uuid().allow("").allow(null).optional(),
});

export const createCouponSchema = Joi.object().keys({
  code: Joi.string().max(100),
  expireTime: Joi.string().max(100),
  ownerId: Joi.number().optional(),
  couponType: Joi.string().valid(...Object.values(CouponType)),
  value: Joi.number(),
  lowestApplicableOrderPrice: Joi.number(),
  shopId: Joi.string().uuid().optional(),
});

export const updateUserSchema = Joi.object().keys({
  username: Joi.string().max(100),
  introduction: Joi.string().max(500),
  avatarUrl: Joi.string().max(500),
});

export const updateShopSchema = Joi.object().keys({
  name: Joi.string().max(100),
  introduction: Joi.string().max(500),
  addressId: Joi.string().uuid(),
  logoUrl: Joi.string(),
  location: Joi.string().max(500),
  ownerId: Joi.number().optional(),
  rating: Joi.number().optional(),
});

export const updateConversationSchema = Joi.object().keys({
  buyerArchived: Joi.boolean().optional(),
  sellerArchived: Joi.boolean().optional(),
  lastMessageText: Joi.string().allow("").allow(null).optional(),
  lastDeliveredAt: Joi.string().allow("").allow(null).optional(),
});
export const createConversationSchema = Joi.object().keys({
  cloudConvId: Joi.string().required(),
  senderId: Joi.number().required(),
  receiverId: Joi.number().required(),
  itemId: Joi.string().uuid().required(),
  lastMessageText: Joi.string().allow("").allow(null).optional(),
  lastDeliveredAt: Joi.string().allow("").allow(null).optional(),
});
