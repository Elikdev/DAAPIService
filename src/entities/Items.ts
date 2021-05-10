import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Orders } from "./Orders";
import { Shops } from "./Shops";

@Index("items_pkey", ["id"], { unique: true })
@Entity("items")
export class Items {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("character varying", {nullable: true })
  name: string | null;

  @Column("double precision", {nullable: true})
  price: number | null;

  @Column("character varying", {nullable: true })
  condition: string | null;

  @Column("character varying", {nullable: true })
  color: string | null;

  @Column("character varying", {nullable: true })
  size: string | null;

  @Column("json", {nullable: true })
  imageUrls: object | null;

  @Column("character varying", {nullable: true })
  factoryDate: string | null;

  @Column("character varying", {nullable: true })
  description: string | null;

  @Column("character varying", {nullable: true })
  status: string | null;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Orders)
  order: Orders;

  @ManyToOne(() => Shops)
  shop: Shops;
}
