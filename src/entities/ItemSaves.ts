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

@Entity("item_saves")
export class ItemSaves extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: string;

  @ManyToOne(() => Items, (items) => items.itemSaves, {
    eager: true,
    onDelete: "CASCADE",
  })
  item: Items;

  @ManyToOne(() => Users, (users) => users.itemSaves, { onDelete: "CASCADE" })
  user: Users;

  @AfterInsert()
  async afterInsertOperations(): Promise<void> {
    Items.createQueryBuilder()
      .update(Items)
      .set({ itemSavesCount: this.item.itemSavesCount + 1 })
      .where("id = :id", { id: this.item.id })
      .execute();
  }

  @AfterRemove()
  async afterRemoveOperations(): Promise<void> {
    Items.createQueryBuilder()
      .update(Items)
      .set({ itemSavesCount: this.item.itemSavesCount - 1 })
      .where("id = :id", { id: this.item.id })
      .execute();
  }
}
