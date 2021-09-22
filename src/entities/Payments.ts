import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Orders } from "./Orders";
import { Users } from "./Users";

export enum PaymentStatus {
  OPEN = "open",
  CONFIRMED = "confirmed",
  REFUNDED = "refunded",
}

export enum Platform {
  MINIPROGRAM = "miniprogram",
  APP = "app",
}

@Entity("payments")
export class Payments extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: string;

  @Column({
    default: 0,
  })
  outTradeNo: string;

  @Column({
    type: "enum",
    enum: Platform,
    default: Platform.MINIPROGRAM,
  })
  platform: string;

  @ManyToOne(() => Users, (users) => users.buyerOrders)
  buyer: Users;

  @Column("double precision")
  amount: number;

  @OneToMany(() => Orders, (orders) => orders.payment, { cascade: true })
  orders: Orders[];

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.OPEN,
  })
  status: string;

  @CreateDateColumn({ type: "timestamp" })
  createdtime: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedtime: string;
}
