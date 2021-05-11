import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Orders } from "./Orders";
import { Shops } from "./Shops";

@Index("users_pkey", ["id"], { unique: true })
@Entity("users")
export class Users {
  @PrimaryGeneratedColumn("increment")
  id: string;

  @Column("character varying", {nullable: true })
  openId: string;

  @Column()
  username: string

  @Column("character varying", {nullable: false })
  mobilePrefix: string;

  @Column("character varying", {nullable: false })
  mobile: string;

  @Column("character varying", {nullable: true })
  fullName: string | null;

  @Column("character varying", {nullable: true })
  avatar: string | null;

  @Column("character varying", {nullable: true })
  email: string | null;

  @Column("character varying", {nullable: true })
  country: string | null;

  @Column("character varying", {nullable: true })
  zipCode: string | null;

  @Column("character varying", {nullable: true })
  province: string | null;

  @Column("character varying", {nullable: true })
  district: string | null;

  @Column("character varying", {nullable: true })
  city: string | null;

  @Column("character varying", {nullable: true })
  shopId: string | null;

  @Column("character varying", {nullable: true })
  role: string | null;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;

  @OneToMany(() => Orders, (orders) => orders.seller)
  orders: Orders[];

  @ManyToMany(() => Shops)
  @JoinTable()
  shops: Shops[];
}
