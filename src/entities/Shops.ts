import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";
import { Orders } from "./Orders";
import { Coupons } from "./Coupons";

import { ShopCollections } from "./ShopCollections";

// type = merchant 为 签约商家
export enum ShopType {
  MERCHANT = "merchant",
  DEFAULT = "default",
}

@Entity("shops")
export class Shops extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: ShopType,
    default: ShopType.DEFAULT,
  })
  type: string;

  @Column("character varying", { nullable: true })
  introduction: string | null;

  @OneToMany(() => Orders, (orders) => orders.shop)
  shopOrders: Orders[];

  @Column("float", { default: 0.0 })
  rating: number;

  @Column("character varying", { nullable: true })
  logoUrl: string;

  @Column("bool", { default: false })
  isSuspended: boolean;

  @Column("character varying", { nullable: true })
  customerServiceUrl: string;

  @Column("character varying", { nullable: true })
  location: string;

  @Column("float", { default: 0.0 })
  commissionRate: number;

  @OneToMany(() => Items, (items) => items.shop, { cascade: true })
  items: Items[];

  @OneToMany(() => Coupons, (coupons) => coupons.shop, { cascade: true })
  coupons: Coupons[];

  @ManyToOne(() => Users, (users) => users.shops)
  owner: Users;

  @ManyToMany(() => ShopCollections, (shopCollections) => shopCollections.shops)
  shopCollections: ShopCollections[];

  @CreateDateColumn({ type: "timestamp" })
  createdtime: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedtime: string;
}
