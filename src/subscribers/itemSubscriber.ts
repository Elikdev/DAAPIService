import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent
} from 'typeorm';
import { Items } from '../entities/Items';
const algoliasearch = require('algoliasearch');
const client = algoliasearch('NUW4UGCBN5', 'b3d50a0c9f8ed7b4a9d44ca93b10cf26');
const index = client.initIndex('retopia_prod_products');

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
    let object: any = event.entity;
    object.objectID = object.id
    console.log(object)
    
    const result = await index.saveObject(object)
      .then(() => {
        console.log("success");
      });

    }

    async beforeUpdate(event: UpdateEvent<Items>) { // to do change to afterUpdate after https://github.com/typeorm/typeorm/commits/master checks into major version.
    let object: any = event.entity;
    
    object.objectID = object.id
    const result = await index.partialUpdateObject(object)
      .then(() => {
        console.log("success");
        delete object.objectID
      });

    }


    //todo after delete.

}