import Joi from "joi";

export const signUpSchema = Joi.object().keys({
  username: Joi.string().required(),
  mobile: Joi.string().pattern(/^[0-9]+$/).required(), 
  mobilePrefix: Joi.string().max(5).required()
});

export const createBuyerAddressSchema = Joi.object().keys({
  fullName: Joi.string().required(),
  province: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  street: Joi.string().required(),
  mobile: Joi.string().pattern(/^[0-9]+$/).required(), 
  buyerId: Joi.string().required(),
  is_default: Joi.boolean().optional()
});

export const updateBuyerAddressSchema = Joi.object().keys({
  fullName: Joi.string().optional(),
  province: Joi.string().optional(),
  city: Joi.string().optional(),
  district: Joi.string().optional(),
  street: Joi.string().optional(),
  mobile: Joi.string().pattern(/^[0-9]+$/).optional(),
  is_default: Joi.boolean().optional()
}).min(1);
