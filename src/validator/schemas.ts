import Joi from "joi";

export const signUpSchema = Joi.object().keys({
  username: Joi.string().required(),
  mobile: Joi.string().pattern(/^[0-9]+$/).required(), 
  mobilePrefix: Joi.string().max(5).required()
});
