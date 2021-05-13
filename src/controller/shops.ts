import { HandleError } from "../decorator/errorDecorator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Shops } from "../entities/Shops";
import { Users } from "../entities/Users";
import { BadRequestError } from "../error/badRequestError";
import { BaseError } from "../error/baseError";
import { RequestValidator } from "../validator/requestValidator";
import { createShopSchema } from "../validator/schemas";

export class ShopController {
  @HandleError("createShop")
  static async createShop(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const shopData = req.body.data;
    const validator = new RequestValidator(createShopSchema);
    validator.validate(shopData);
    const shopRepo = getRepository(Shops);
    const user = await Users.findOne({id: userId});
    if (!user) {
      throw new BaseError("User doesn't exist.");
    }
    if (user.shops && user.shops.length > 0) {
      throw new BadRequestError("More than one shops is now allowed.");
    }
    shopData.owner = user;
    const createdShop = await shopRepo.save(shopData);
    res.send({
      data: createdShop
    });
  }

  @HandleError("getShops")
  static async getShops(req: Request, res: Response): Promise<void> {
    const shops = await getRepository(Shops)
      .createQueryBuilder("shops")
      .leftJoinAndSelect("shops.owner", "users")
      .select(["shops.id", "shops.name", "shops.introduction", "shops.logoUrl", "users.id", "users.username"])
      .getMany();
  
    res.send({
      data: shops
    });
  }

  @HandleError("getShopItems")
  static async getShopItems(req: Request, res: Response): Promise<void> {
    const shopId = req.params.id;
    const shopItems = await getRepository(Shops)
      .createQueryBuilder("shops")
      .leftJoinAndSelect("shops.items", "items")
      .where("shops.id = :id", { id: shopId })
      .getOne();

    res.send({
      data: shopItems
    });
  }
}