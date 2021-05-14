import { AfterInsert, BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";

@Entity("item_saves")
export class ItemSaves extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @CreateDateColumn({type: "timestamp"})
  createdAt: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: string;

  @ManyToOne(() => Items, (items) => items.itemSaves)
  item: Items;

  @ManyToOne(() => Users, (users) => users.itemSaves)
  user: Users;

  @AfterInsert()
  async updateItemSavesCount() {
    await Items.createQueryBuilder().update(Items)
      .set({itemSavesCount: this.item.itemSavesCount + 1})
      .where("id = :id", { id: this.item.id })
      .execute();
  }
}
