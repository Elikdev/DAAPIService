import Joi from "joi";

export const signUpSchema = Joi.object().keys({
  username: Joi.string().required(),
  mobile: Joi.string().pattern(/^[0-9]+$/).required(), 
  mobilePrefix: Joi.string().max(5).required(),
  code: Joi.string().required()
});

export const createItemSchema = Joi.object().keys({
  name: Joi.string().required(),
  price: Joi.number().required(),
  condition: Joi.string().required(),
  color: Joi.string().optional(),
  size: Joi.string().required(),
  imageUrls: Joi.string().required(),
  factoryDate: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().required(),
  shopId: Joi.string().required()
});

export const updateItemSchema = Joi.object().keys({
  name: Joi.string().optional(),
  price: Joi.number().optional(),
  condition: Joi.string().optional(),
  color: Joi.string().optional(),
  size: Joi.string().optional(),
  imageUrls: Joi.string().optional(),
  factoryDate: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.string().optional(),
  orderId: Joi.string().optional()
});

export const createAddressSchema = Joi.object().keys({
  fullName: Joi.string().required(),
  province: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  street: Joi.string().required(),
  mobile: Joi.string().pattern(/^[0-9]+$/).required(), 
  isDefault: Joi.boolean().optional()
});

export const updateAddressSchema = Joi.object().keys({
  fullName: Joi.string().optional(),
  province: Joi.string().optional(),
  city: Joi.string().optional(),
  district: Joi.string().optional(),
  street: Joi.string().optional(),
  mobile: Joi.string().pattern(/^[0-9]+$/).optional(),
  isDefault: Joi.boolean().optional(),
  isDefaultBeforeUpdate: Joi.boolean().optional()
}).min(1);
