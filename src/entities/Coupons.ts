import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne
} from "typeorm";
import { Users } from "./Users";
import { Orders } from "./Orders";

export enum CouponType {
  PERCENTOFF = "percentOff",
  AMOUNTOFF = "amountOff"
}

@Entity("coupons")
export class Coupons extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  code: string;

  @Column("bool", {default: false })
  isValid: boolean;

  @Column("bool", {default: false })
  applied: boolean;

  @Column({
    type: "enum",
    enum: CouponType,
    default: CouponType.AMOUNTOFF
  })
  couponType: string;

  @Column({
    nullable: true,
    default: 0,
  })
  value: number;

  @ManyToOne(() => Users, (users) => users.coupons)
  owner: Users;

  @Column({type: "timestamp"})
  expireTime: string;

  @CreateDateColumn({type: "timestamp"})
  createdtime: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedtime: string;
 
  @OneToMany(() => Orders, (orders) => orders.coupon, { cascade: true })
  orders: Orders[];

}
