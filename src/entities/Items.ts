import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Orders } from "./Orders";
import { Shops } from "./Shops";
import { ItemSaves } from "./ItemSaves";
import { ItemLikes } from "./ItemLikes";

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

@Index("items_pkey", ["id"], { unique: true })
@Entity("items")
export class Items extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("character varying", {nullable: true })
  name: string | null;

  @Column("double precision", {nullable: false})
  price: number;

  @Column({
    type: "enum",
    enum: ItemCondition,
    default: ItemCondition.EXCELLENT
  })
  condition: number;

  @Column("character varying", {nullable: true })
  color: string | null;

  @Column("character varying", {nullable: true })
  size: string | null;

  @Column("json", {nullable: true })
  imageUrls: object | null;

  @Column({
    nullable: true,
    default: 1,
  })
  stock: number;

  @Column({
    nullable: true
  })
  year: string;

  @Column("character varying", {nullable: true })
  description: string | null;

  @Column({
    type: "enum",
    enum: ListingStatus,
    default: ListingStatus.NEW
  })
  status: string;

  @Column({
    nullable: true,
    length: 50,
  })
  brand: string;

  @Column({
    nullable: true,
    length: 50,
  })
  origin: string

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

  @CreateDateColumn({type: "timestamp"})
  createdtime: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedtime: string;

  @ManyToOne(() => Orders, orders => orders.orderItems)
  order: Orders;

  @ManyToOne(() => Shops, shops => shops.items)
  shop: Shops;

  @OneToMany(() => ItemSaves, (itemSaves) => itemSaves.item, { cascade: true })
  itemSaves: ItemSaves[];

  @OneToMany(() => ItemLikes, (itemLikes) => itemLikes.item, { cascade: true })
  itemLikes: ItemLikes[];

  @Column({default: 0})
  itemSavesCount: number;

  @Column({default: 0})
  itemLikesCount: number;
}
