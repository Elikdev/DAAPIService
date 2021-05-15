import { HandleError } from "../decorator/errorDecorator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Shops } from "../entities/Shops";
import { Users } from "../entities/Users";
import { BadRequestError } from "../error/badRequestError";
import { RequestValidator } from "../validator/requestValidator";
import { createShopSchema, updateShopSchema } from "../validator/schemas";
import { ResourceNotFoundError } from "../error/notfoundError";

const MAX_OWNED_SHOPS = 3;

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
      throw new ResourceNotFoundError("User doesn't exist.");
    }
    const ownedShops = await Shops.find({owner: user});
    if (ownedShops.length >= MAX_OWNED_SHOPS) {
      throw new BadRequestError(`No more than ${MAX_OWNED_SHOPS} shops is allowed.`);
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

  @HandleError("updateShop")
  static async updateShop(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const shopId = req.params.id;
    const shopData = req.body.data;

    const validator = new RequestValidator(updateShopSchema);
    validator.validate(shopData);

    const shopRepo = await getRepository(Shops);
    const result = await shopRepo.createQueryBuilder()
      .update(Shops, shopData)
      .where("id = :id", { id: shopId })
      .andWhere("ownerId = :userId", {userId: userId})
      .returning("*")
      .updateEntity(true)
      .execute()
      .then(response => response.raw[0]);
    
    if (!result) {
      throw new ResourceNotFoundError("Shop not found.");
    }
    res.send({
      data: result
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