import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Orders } from "./Orders";
import { Shops } from "./Shops";

@Index("users_pkey", ["id"], { unique: true })
@Entity("users", { schema: "public" })
export class Users {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "open_id", nullable: true })
  openId: string | null;

  @Column("character varying", { name: "full_name", nullable: true })
  fullName: string | null;

  @Column("character varying", { name: "avatar", nullable: true })
  avatar: string | null;

  @Column("character varying", { name: "phone", nullable: true })
  phone: string | null;

  @Column("character varying", { name: "email", nullable: true })
  email: string | null;

  @Column("character varying", { name: "country", nullable: true })
  country: string | null;

  @Column("character varying", { name: "zip_code", nullable: true })
  zipCode: string | null;

  @Column("character varying", { name: "province", nullable: true })
  province: string | null;

  @Column("character varying", { name: "district", nullable: true })
  district: string | null;

  @Column("character varying", { name: "shop_id", nullable: true })
  shopId: string | null;

  @Column("character varying", { name: "role", nullable: true })
  role: string | null;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @Column("character varying", { name: "city", nullable: true })
  city: string | null;

  @OneToMany(() => Orders, (orders) => orders.seller)
  orders: Orders[];

  @OneToMany(() => Shops, (shops) => shops.owner)
  shops: Shops[];
}
