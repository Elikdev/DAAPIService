import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Orders } from "./Orders";
import { Shops } from "./Shops";
import { Addresses } from "./Addresses";

@Index("users_pkey", ["id"], { unique: true })
@Entity("users")
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("character varying", {nullable: true })
  openId: string;

  @Column()
  username: string

  @Column("character varying", {nullable: false })
  mobilePrefix: string;

  @Column("character varying", {nullable: false })
  mobile: string;

  @Column("character varying", {nullable: true })
  shopId: string | null;

  @Column("character varying", {nullable: true })
  role: string | null;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;

  @OneToMany(() => Orders, (orders) => orders.seller)
  orders: Orders[];

  @OneToMany(() => Shops, (shops) => shops.owner, { cascade: true })
  @JoinColumn()
  shops: Shops[];

  @OneToMany(() => Addresses, addresses => addresses.user)
  addresses: Addresses[];

  @OneToOne(() => Addresses, {nullable: true })
  @JoinColumn()
  defaultAddress: Addresses | null;
}
