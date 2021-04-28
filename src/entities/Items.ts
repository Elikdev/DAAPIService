import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn
} from "typeorm";
import { ItemComments } from "./ItemComments";
import { ItemLikes } from "./ItemLikes";
import { ItemSaves } from "./ItemSaves";
import { Orders } from "./Orders";
import { Shops } from "./Shops";

@Index("items_pkey", ["id"], { unique: true })
@Entity("items", { schema: "public" })
export class Items {
  @PrimaryColumn("integer", { primary: true, name: "id" })
  id: number;

  @Column("character varying", { name: "name", nullable: true })
  name: string | null;

  @Column("double precision", { name: "price", nullable: true})
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

  @OneToMany(() => ItemComments, (itemComments) => itemComments.item)
  itemComments: ItemComments[];

  @OneToMany(() => ItemLikes, (itemLikes) => itemLikes.item)
  itemLikes: ItemLikes[];

  @OneToMany(() => ItemSaves, (itemSaves) => itemSaves.item)
  itemSaves: ItemSaves[];

  @ManyToOne(() => Orders, (orders) => orders.items2)
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: Orders;

  @ManyToOne(() => Shops, (shops) => shops.items)
  @JoinColumn([{ name: "shop_id", referencedColumnName: "id" }])
  shop: Shops;
}
