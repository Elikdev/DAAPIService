import {
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";
import { Addresses } from "./Addresses";
import { Shops } from "./Shops";

export enum OrderStatus {
  OPEN = "open",
  PAID = "paid",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum OrderCNStatus {
  OPEN = "未付款",
  PAID = "已付款",
  CONFIRMED = "已确认",
  SHIPPED = "待收货",
  COMPLETED = "已完成",
  CANCELLED = "已取消"
}

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
  totalPrice: number | null;

  @Column("double precision", {nullable: true })
  itemsPrice: number | null;

  @Column("double precision", {nullable: true })
  processingFee: number | null;

  @Column("character varying", {nullable: true })
  trackingNum: string | null;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.OPEN
  })
  status: string;

  @CreateDateColumn({type: "timestamp"})
  createdtime: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedtime: string;

  @OneToMany(() => Items, (items) => items.order, { cascade: true })
  orderItems: Items[];
}
