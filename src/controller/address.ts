import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Addresses } from "../entities/Addresses";
import { Users } from "../entities/Users";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createAddressSchema, updateAddressSchema } from "../validator/schemas";

export class AddressController {

  @HandleError("createAddress")
  static async createAddress(req: Request, res: Response): Promise<void> {
    const addressData = req.body.data;
    const userId = req.body.userId;
    const validator = new RequestValidator(createAddressSchema);
    validator.validate(addressData);

    const userRepo = getRepository(Users);
    const user = await userRepo.findOne({id: userId});

    addressData.user = user;
    const result = await getRepository(Addresses).save(addressData);
    logger.info("Address created.");

    const isDefault = addressData.isDefault;
    if (isDefault) {
      await userRepo.update(userId, {defaultAddress: result});                   
    }

    res.send({
      data: result
    });
  }

  @HandleError("updateAddress")
  static async updateAddress(req: Request, res: Response): Promise<void> {
    const addressData = req.body.data;
    const validator = new RequestValidator(updateAddressSchema);
    validator.validate(addressData);
    const isDefault = addressData.isDefault;
    const isDefaultBeforeUpdate = addressData.isDefaultBeforeUpdate;
    delete addressData.isDefault;
    delete addressData.isDefaultBeforeUpdate;

    const addressId = req.params.id;
    const addressRepo = getRepository(Addresses);

    const buyerAddress = await addressRepo.findOne({id: addressId});
    if (!buyerAddress) {
      throw new ResourceNotFoundError("Address not found.");
    }

    const result = await addressRepo.createQueryBuilder()
      .update(Addresses, addressData)
      .where("id = :id", { id: addressId })
      .returning("*")
      .updateEntity(true)
      .execute()
      .then(response => response.raw[0]);

    if (isDefault !== isDefaultBeforeUpdate) {
      const userId = req.body.userId;
      const userRepo = getRepository(Users);
      const user = await userRepo.findOne({id: userId});
      if (isDefault) {
        await userRepo.update(userId, {defaultAddress: result}); 
      } else {
        await userRepo.update(userId, {defaultAddress: null}); 
      }
    }                   

    res.send({
      data: result
    });
  }
  
  @HandleError("deleteAddress")
  static async deleteAddress(req: Request, res: Response): Promise<void> {
    const addressId = req.params.id;
    const addressRepo = getRepository(Addresses);

    const buyerAddress = await addressRepo.findOne({id: addressId});
    if (!buyerAddress) {
      throw new ResourceNotFoundError("Address not found.");
    }

    const result = await addressRepo.createQueryBuilder()
      .update(Addresses, {isActive: false})
      .where("id = :id", { id: addressId })
      .returning("*")
      .updateEntity(true)
      .execute()
      .then(response => response.raw[0]);
    logger.info("Address deleted.");
    res.send({
      data: result
    });
  }

  @HandleError("getAddresses")
  static async getAddresses(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const user = await getRepository(Users)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.addresses", "address", "address.isActive = :isActive", {isActive: true})
      .leftJoinAndSelect("user.defaultAddress", "defaultAddress", "defaultAddress.isActive = :isActive", {isActive: true})
      .where("user.id = :id", { id: userId })
      .getOne();
                    
    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }              

    const result = {addresses: user.addresses, defaultAddress: user.defaultAddress};
    res.send({
      data: result
    });
  }  
}