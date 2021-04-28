import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Orders } from "./Orders";
import { Shops } from "./Shops";
import { ItmeComments } from "./ItmeComments";
import { ItmeLikes } from "./ItmeLikes";
import { ItmeSaves } from "./ItmeSaves";

@Index("items_pkey", ["id"], { unique: true })
@Entity("items", { schema: "public" })
export class Items {
  @Column("integer", { primary: true, name: "id" })
  id: number;

  @Column("character varying", { name: "name", nullable: true })
  name: string | null;

  @Column("double precision", { name: "price", nullable: true, precision: 53 })
  price: number | null;

  @Column("character varying", { name: "condition", nullable: true })
  condition: string | null;

  @Column("character varying", { name: "color", nullable: true })
  color: string | null;

  @Column("character varying", { name: "size", nullable: true })
  size: string | null;

  @Column("character varying", { name: "description", nullable: true })
  description: string | null;

  @Column("character varying", { name: "status", nullable: true })
  status: string | null;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Orders, (orders) => orders.items2)
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: Orders;

  @ManyToOne(() => Shops, (shops) => shops.items)
  @JoinColumn([{ name: "shop_id", referencedColumnName: "id" }])
  shop: Shops;

  @OneToMany(() => ItmeComments, (itmeComments) => itmeComments.item)
  itmeComments: ItmeComments[];

  @OneToMany(() => ItmeLikes, (itmeLikes) => itmeLikes.item)
  itmeLikes: ItmeLikes[];

  @OneToMany(() => ItmeSaves, (itmeSaves) => itmeSaves.item)
  itmeSaves: ItmeSaves[];
}
