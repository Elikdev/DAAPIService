import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";

@Entity("conversations")
export class Conversations extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("character varying", { nullable: true })
  cloudConvId: string;

  @Column("character varying", { nullable: true })
  lastMessageText: string;

  @Column("character varying", { nullable: true })
  lastDeliveredAt: string;

  @ManyToOne(() => Items, (items) => items.conversations, {
    eager: true,
    onDelete: "CASCADE",
  })
  item: Items;

  @ManyToOne(() => Users, (users) => users.senderConversations, {
    eager: true,
    onDelete: "CASCADE",
  })
  sender: Users;

  @ManyToOne(() => Users, (users) => users.reciverConversations, {
    eager: true,
    onDelete: "CASCADE",
  })
  receiver: Users;
  @Column("bool", { default: false })
  buyerArchived: boolean;

  @Column("bool", { default: false })
  isSuspended: boolean;

  @Column("bool", { default: false })
  sellerArchived: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: string;
}
