import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
} from "typeorm";
import { Orders } from "./Orders";
import { Shops } from "./Shops";
import { Reviews } from "./Reviews";
import { ItemSaves } from "./ItemSaves";
import { ItemLikes } from "./ItemLikes";
import { Conversations } from "./Conversations";
import { Collections } from "./Collections";
import { RecentlyViewed } from "./RecentlyViewed";
import { Carts } from "./Cart";
import { Events } from "./Events";

import { ItemComments } from "./ItemComments";

export enum ListingStatus {
  NEW = "new",
  SOLD = "sold",
  DELISTED = "delisted",
}

export enum ItemCondition {
  NEW = 5,
  LIKE_NEW = 4,
  EXCELLENT = 3,
  GOOD = 2,
  FAIR = 1,
}

export enum AuditStatus {
  PENDING = "pending",
  PASS = "pass",
  FAIL = "fail",
}

export enum AuditReasonCode {
  PENDING = "pending",
  INCOMPLETE_DESCRIPTION = "incomplete_description",
  INAPPROPRIATE_DESCRIPTION = "inappropriate_description",
  INVALID_ITEM_PRICE = "invalid_item_price",
  INAPPROPRIATE_IMAGE_CONTENT = "inappropriate_image_content",
  UNQUALIFIED_IMAGES = "unqualified_images",
}

export enum ShippingType {
  SHIPPED = "shipped",
  PAY_ON_DELIVERY = "payOnDelivery",
}

@Index("items_pkey", ["id"], { unique: true })
@Entity("items")
export class Items extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("character varying", { nullable: true })
  name: string | null;

  @Column("double precision", { nullable: false })
  price: number;

  @Column({
    type: "enum",
    enum: ItemCondition,
    default: ItemCondition.EXCELLENT,
  })
  condition: number;

  @Column("character varying", { nullable: true })
  color: string | null;

  @Column("character varying", { nullable: true })
  size: string | null;

  @Column("character varying", { array: true, nullable: true })
  imageUrls: string[] | null;

  @Column({
    nullable: true,
    default: 1,
  })
  stock: number;

  @Column({
    nullable: true,
  })
  year: string;

  @Column({
    type: "enum",
    enum: AuditStatus,
    default: AuditStatus.PENDING,
  })
  auditStatus: string;

  @Column({
    type: "enum",
    enum: AuditReasonCode,
    default: AuditReasonCode.PENDING,
  })
  auditReasonCode: string;

  @Column("character varying", { nullable: true })
  description: string | null;

  @Column({
    type: "enum",
    enum: ListingStatus,
    default: ListingStatus.NEW,
  })
  status: string;

  @Column({
    nullable: true,
    length: 50,
  })
  brand: string;

  @Column({
    type: "enum",
    enum: ShippingType,
    default: ShippingType.SHIPPED,
  })
  shippingType: string;

  @Column({
    nullable: true,
    length: 50,
  })
  origin: string;

  @Column({
    nullable: true,
    length: 50,
  })
  category: string;

  @Column({
    nullable: true,
    length: 50,
  })
  subcategory: string;

  @CreateDateColumn({ type: "timestamp" })
  createdtime: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedtime: string;

  @ManyToMany(() => Orders, (orders) => orders.orderItems)
  orders: Orders[];

  @ManyToOne(() => Shops, (shops) => shops.items)
  shop: Shops;

  @ManyToOne(() => Reviews, (reviews) => reviews.items)
  review: Reviews;

  @OneToMany(() => ItemSaves, (itemSaves) => itemSaves.item, { cascade: true })
  itemSaves: ItemSaves[];

  @OneToMany(() => Conversations, (conversations) => conversations.item, {
    cascade: true,
  })
  conversations: Conversations[];

  @OneToMany(() => ItemLikes, (itemLikes) => itemLikes.item, { cascade: true })
  itemLikes: ItemLikes[];

  @OneToMany(() => RecentlyViewed, (recentViewed) => recentViewed.item, {
    cascade: true,
  })
  recentlyViewed: RecentlyViewed[];

  @ManyToMany(() => Collections, (collections) => collections.items)
  collections: Collections[];

  @OneToMany(() => ItemComments, (itemComments) => itemComments.item)
  itemComments: ItemComments[];

  @ManyToMany(() => Carts, (carts) => carts.items)
  carts: Carts[];

  @ManyToMany(() => Events, (events) => events.items)
  events: Events[];

  @Column({ default: 0 })
  itemSavesCount: number;

  @Column({ default: 0 })
  itemLikesCount: number;

  @Column({ default: 0 })
  score: number;
}
