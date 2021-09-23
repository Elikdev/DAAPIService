import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";

@Entity("item_comments")
export class ItemComments extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @ManyToOne(() => Users, (user) => user.itemComments)
  commenter: Users;

  @Column("character varying", { nullable: true })
  content: string | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: string;

  @Column("bool", { default: false })
  isSuspended: boolean;

  @ManyToOne(() => Items, (items) => items.itemComments)
  item: Items;
}
