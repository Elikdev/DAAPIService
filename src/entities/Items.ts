import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { ItemComments } from "./ItemComments";
import { ItemLikes } from "./ItemLikes";
import { ItemSaves } from "./ItemSaves";
import { Orders } from "./Orders";
import { Shops } from "./Shops";

@Index("items_pkey", ["id"], { unique: true })
@Entity("items", { schema: "public" })
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

  @Column("character varying", {nullable: true })
  description: string | null;

  @Column("character varying", {nullable: true })
  status: string | null;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;

  @OneToMany(() => ItemComments, (itemComments) => itemComments.item)
  itemComments: ItemComments[];

  @OneToMany(() => ItemLikes, (itemLikes) => itemLikes.item)
  itemLikes: ItemLikes[];

  @OneToMany(() => ItemSaves, (itemSaves) => itemSaves.item)
  itemSaves: ItemSaves[];

  @ManyToOne(() => Orders, (orders) => orders.orderItems)
  @JoinColumn([{referencedColumnName: "id" }])
  order: Orders;

  @ManyToOne(() => Shops, (shops) => shops.items)
  @JoinColumn([{referencedColumnName: "id" }])
  shop: Shops;
}
