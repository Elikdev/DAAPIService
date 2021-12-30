import {
  AfterInsert,
  AfterRemove,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";

@Entity("item_likes")
export class ItemLikes extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: string;

  @ManyToOne(() => Items, (items) => items.itemLikes, {
    eager: true,
    onDelete: "CASCADE",
  })
  item: Items;

  @ManyToOne(() => Users, (users) => users.itemLikes, { onDelete: "CASCADE" })
  user: Users;

  @AfterInsert()
  async afterInsertOperations(): Promise<void> {
    console.log("Incrementing item likes count");
    const result = await Items.createQueryBuilder()
      .update(Items)
      .set({ itemLikesCount: this.item.itemLikesCount + 1 })
      .where("id = :id", { id: this.item.id })
      .execute()
      .then((response) => response.raw[0]);
    console.log(result);
  }

  @AfterRemove()
  async afterRemoveOperations(): Promise<void> {
    console.log("Decrementing item likes count");

    Items.createQueryBuilder()
      .update(Items)
      .set({ itemLikesCount: this.item.itemLikesCount - 1 })
      .where("id = :id", { id: this.item.id })
      .execute();
  }
}
