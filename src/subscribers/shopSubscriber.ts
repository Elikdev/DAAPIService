import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent
} from "typeorm";
import { Shops } from "../entities/Shops";
const algoliasearch = require("algoliasearch");
const client = algoliasearch("NUW4UGCBN5", "b3d50a0c9f8ed7b4a9d44ca93b10cf26");
const index = client.initIndex("retopia_prod_shops");
const APP_ENV = process.env.APP_ENV;

@EventSubscriber()
export class ItemsSubscriber implements EntitySubscriberInterface<Shops> {


  /**
     * Indicates that this subscriber only listen to Shops events.
     */
  listenTo() {
    return Shops;
  }

  /**
     * Called after post insertion.
     */
  async afterInsert(event: InsertEvent<Shops>) {
    if (APP_ENV === "production") {
      const object: any = event.entity;
      object.objectID = object.id;    
      const result = await index.saveObject(object)
        .then(() => {
          console.log("success");
        });
    }
  }

  async beforeUpdate(event: UpdateEvent<Shops>) { // to do change to afterUpdate after https://github.com/typeorm/typeorm/commits/master checks into major version.
    if (APP_ENV === "production") {
      const object: any = event.entity;
      object.objectID = object.id;
      const result = await index.partialUpdateObject(object)
        .then(() => {
          console.log("success");
          delete object.objectID;
        });
    }

  }

}