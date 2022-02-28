import {
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";
import { Addresses } from "./Addresses";
import { Shops } from "./Shops";
import { Payments } from "./Payments";
import { Coupons } from "./Coupons";

export enum OrderStatus {
  OPEN = "open",
  PAID = "paid",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  SETTLED = "settled",
}

export enum OrderCNStatus {
  OPEN = "未付款",
  PAID = "已付款",
  CONFIRMED = "待发货",
  SHIPPED = "待收货",
  COMPLETED = "已完成",
  CANCELLED = "已取消",
  SETTLED = "已结算",
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

  @ManyToOne(() => Payments, (payments) => payments.orders)
  payment: Payments;

  @Column("double precision", { nullable: true })
  totalPrice: number | null;

  @Column("double precision", { nullable: true })
  itemsPrice: number | null;

  @Column("double precision", { nullable: true })
  processingFee: number | null;

  @Column("character varying", { nullable: true })
  trackingNum: string | null;

  @Column("character varying", { nullable: true })
  orderNotes: string | null;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.OPEN,
  })
  status: string;

  @CreateDateColumn({ type: "timestamp" })
  createdtime: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedtime: string;

  @ManyToMany(() => Items, (items) => items.orders, { cascade: true })
  @JoinTable()
  orderItems: Items[];

  @ManyToOne(() => Coupons, (coupons) => coupons.orders)
  coupon: Coupons;
}
