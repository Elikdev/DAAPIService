import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent
} from "typeorm";
import { Items } from "../entities/Items";
const algoliasearch = require("algoliasearch");
const client = algoliasearch("NUW4UGCBN5", "b3d50a0c9f8ed7b4a9d44ca93b10cf26");
const index = client.initIndex("retopia_prod_products");
const APP_ENV = process.env.APP_ENV;

@EventSubscriber()
export class ItemsSubscriber implements EntitySubscriberInterface<Items> {


  /**
     * Indicates that this subscriber only listen to Items events.
     */
  listenTo() {
    return Items;
  }

  /**
     * Called after post insertion.
     */
  async afterInsert(event: InsertEvent<Items>) {
    if (APP_ENV === "production") {
      const object: any = event.entity;
      object.objectID = object.id;    
      const result = await index.saveObject(object)
        .then(() => {
          console.log("success");
        });
    }
  }

  async beforeUpdate(event: UpdateEvent<Items>) { // to do change to afterUpdate after https://github.com/typeorm/typeorm/commits/master checks into major version.
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


  //todo after delete.

}