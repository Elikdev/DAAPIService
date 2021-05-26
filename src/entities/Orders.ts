import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";
import { Addresses } from "./Addresses";
import { Shops } from "./Shops";

@Index("orders_pkey", ["id"], { unique: true })
@Entity("orders")
export class Orders extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Users, (users) => users.buyerOrders)
  buyer: Users;

  @ManyToOne(() => Shops, (shops) => shops.shopOrders)
  shop: Shops;

  @ManyToOne(() => Addresses, (addresses) => addresses.orders)
  buyerAddress: Addresses;

  @Column("double precision", {nullable: true })
  amount: number | null;

  @Column("json", {nullable: true })
  itemsJson: string | null;

  @Column("character varying", {nullable: true })
  trackingNum: string | null;

  @Column("character varying", {nullable: true })
  status: string | null;

  @Column("timestamp without time zone", {nullable: true })
  updatedAt: Date | null;

  @Column("character varying", {nullable: true })
  createdAt: string | null;

  @OneToMany(() => Items, (items) => items.order)
  orderItems: Items[];
}
