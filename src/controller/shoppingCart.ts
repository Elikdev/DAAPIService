import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items } from "../entities/Items";
import { Users } from "../entities/Users";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { Carts } from "../entities/Cart";

export class ShoppingCartController {

  @HandleError("getCart")
  static async getCart(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const user = await getRepository(Users).findOne({id: userId});
    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }
    
    const cartRepo =  await getRepository(Carts);
    const cart = await cartRepo.createQueryBuilder("cart")
      .leftJoinAndSelect("cart.items", "items").leftJoinAndSelect("items.shop", "shop").where("cart.ownerId = :userId", {userId: user.id}).getOne();

    res.send({
      data: cart
    });
  }

  @HandleError("addCartItem")
  static async addCartItem(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const itemId = req.params.id;

    const item = await getRepository(Items).findOne({id: itemId});
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }
    const user = await getRepository(Users).findOne({id: userId});
    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }

    const cartRepo =  await getRepository(Carts);
    const cart = await cartRepo.findOne({owner: user});
  
    if (cart) {
      const cartItems = cart.items;
      if (cart.items) {

        // if already in cart, just return
        cartItems.forEach(item => {
          if (item.id === itemId) {
            res.send({
              data: cart
            });
          }
        });

        cart.items.concat(item);
      } else {
        cart.items = [item];
      }

      await cartRepo.save(cart);

    // if cart doesn't exist, create new one
    } else {
      const newCart = new Carts();
      newCart.items= [item];
      newCart.owner = user;
      await newCart.save();
      logger.info("New cart created.");
    }

    res.send({
      data: cart
    });
  }

  @HandleError("removeCartItem")
  static async removeCartItem(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const itemId = req.params.id;

    const item = await getRepository(Items).findOne({id: itemId});
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }
    const user = await getRepository(Users).findOne({id: userId});
    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }

    const cartRepo =  await getRepository(Carts);
    const cart = await cartRepo.findOne({owner: user});

    if (!cart) {
      throw new ResourceNotFoundError("User's cart is not found.");
    }
    const cartItems = cart.items;
    if (cartItems) {
      cart.items = cartItems.filter(item => item.id !== itemId);
      await cartRepo.save(cart);
    }

    res.send({
      data: cart
    });
  } 
}