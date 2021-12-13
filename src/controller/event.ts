import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus } from "../entities/Items";
import { Events } from "../entities/Events";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { Carts } from "../entities/Cart";

export class EventController {
  @HandleError("getEvent")
  static async getEvent(req: Request, res: Response): Promise<void> {
    const name = req.params.eventName;
    const event = await getRepository(Events).findOne({ name: name });
    if (!event) {
      throw new ResourceNotFoundError("Event is not found.");
    }

    res.send({
      data: event,
    });
  }

  @HandleError("getEvents")
  static async getEvents(req: Request, res: Response): Promise<void> {
    const eventRepo = await getRepository(Events);
    const event = await eventRepo
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.shops", "shops")
      .getMany();

    if (!event) {
      throw new ResourceNotFoundError("Event is not found.");
    }

    res.send({
      data: event,
    });
  }

  @HandleError("addEventItems")
  static async addEventItems(req: Request, res: Response): Promise<void> {
    const itemId = req.params.itemId;
    const eventName = req.params.eventName;

    const item = await getRepository(Items).findOne({ id: itemId });
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }

    const eventRepo = await getRepository(Events);
    const event = await eventRepo
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.items", "items")
      .where("event.name = :name", { name: eventName })
      .getOne();

    if (event) {
      const eventItems = event.items;
      if (event.items) {
        // if already in cart, just return
        eventItems.forEach((item) => {
          if (item.id === itemId) {
            return;
          }
        });

        event.items = eventItems.concat(item);
      } else {
        event.items = [item];
      }

      await event.save();

      // if cart doesn't exist, create new one
    } else {
      throw new ResourceNotFoundError("Event is not found.");
    }

    res.send({
      data: event,
    });
  }

  @HandleError("removeEventItem")
  static async removeEventItems(req: Request, res: Response): Promise<void> {
    const eventName = req.params.eventName;
    const itemId = req.params.itemId;

    const item = await getRepository(Items).findOne({ id: itemId });
    if (!item) {
      throw new ResourceNotFoundError("Item not found.");
    }

    const eventRepo = await getRepository(Events);
    const event = await eventRepo
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.items", "items")
      .where("event.name = :name", { name: eventName })
      .getOne();

    if (!event) {
      throw new ResourceNotFoundError("Event is not found.");
    }
    const eventItems = event.items;
    if (eventItems) {
      event.items = eventItems.filter((item) => item.id !== itemId);
      await event.save();
    }

    res.send({
      data: event,
    });
  }

  @HandleError("getShopEventItems")
  static async getShopEventItems(req: Request, res: Response): Promise<void> {
    const eventName = req.params.eventName;
    const shopId = req.params.shopId;

    const eventRepo = await getRepository(Events);
    const event = await eventRepo
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.items", "items")
      .leftJoinAndSelect("items.shop", "shops")
      .where("event.name = :name", { name: eventName })
      .where("shops.id = :id", { id: shopId })
      .getOne();

    if (!event) {
      throw new ResourceNotFoundError("Event is not found.");
    }

    res.send({
      data: event,
    });
  }

  @HandleError("getEventItems")
  static async getEventItems(req: Request, res: Response): Promise<void> {
    const eventName = req.params.eventName;

    const eventRepo = await getRepository(Events);
    const event = await eventRepo
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.items", "items")
      .where("event.name = :name", { name: eventName })
      .getOne();

    if (!event) {
      throw new ResourceNotFoundError("Event is not found.");
    }

    res.send({
      data: event,
    });
  }
}
