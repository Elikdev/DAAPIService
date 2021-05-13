import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { BuyerAddresses } from "../entities/BuyerAddresses";
import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createBuyerAddressSchema, updateBuyerAddressSchema } from "../validator/schemas";

export class BuyerAddressController {

  @HandleError("createBuyerAddress")
  static async createBuyerAddress(req: Request, res: Response): Promise<void> {
    const buyerAddressData = req.body.data;
    const validator = new RequestValidator(createBuyerAddressSchema);
    validator.validate(buyerAddressData);

    const result = await getRepository(BuyerAddresses).save(buyerAddressData);
    logger.info("BuyerAddress created.");

    //TODO: add default address logic

    res.send({
      data: result
    });
  }

  @HandleError("getBuyerAddressById")
  static async getBuyerAddressById(req: Request, res: Response): Promise<void> {
    const buyerAddressId = req.params.id;

    const buyerAddress = await getRepository(BuyerAddresses).findOne({id: buyerAddressId});
    if (!buyerAddress) {
      throw new ResourceNotFoundError("BuyerAddress not found.");
    }

    res.send({
      data: buyerAddress
    });
  }

  @HandleError("updateBuyerAddress")
  static async updateBuyerAddress(req: Request, res: Response): Promise<void> {
    const buyerAddressData = req.body.data;
    const validator = new RequestValidator(updateBuyerAddressSchema);
    validator.validate(buyerAddressData);

    const buyerAddressId = req.params.id;
    const buyerAddressRepo = getRepository(BuyerAddresses);

    const buyerAddress = await buyerAddressRepo.findOne({id: buyerAddressId});
    if (!buyerAddress) {
      throw new ResourceNotFoundError("BuyerAddress not found.");
    }

    const result = await buyerAddressRepo.createQueryBuilder()
                       .update(BuyerAddresses, buyerAddressData)
                       .where('id = :id', { id: buyerAddressId })
                       .returning('*')
                       .updateEntity(true)
                       .execute()
                       .then(response => response.raw[0]);

    res.send({
      data: result
    });
  }

  @HandleError("getDefaultBuyerAddress")
  static async getDefaultBuyerAddress(req: Request, res: Response): Promise<void> {
    //TODO
  }

  @HandleError("setDefaultBuyerAddress")
  static async setDefaultBuyerAddress(req: Request, res: Response): Promise<void> {
    //TODO
  }

  @HandleError("getBuyerAddresses")
  static async getBuyerAddresses(req: Request, res: Response): Promise<void> {
    //TODO
  }  
}