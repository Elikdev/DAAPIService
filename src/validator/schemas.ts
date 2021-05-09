import Joi from "joi";

export const exampleSchema = Joi.object().keys({
  title: Joi.string().required(),
  engTitle: Joi.string(),
  description: Joi.string(),
  manufacter: Joi.string(),
  origin: Joi.string(),
  retailPrice: Joi.number(),
  category: Joi.string(),
  abv: Joi.number(),
  volume: Joi.number(),
  descriptors: Joi.string(),
});
