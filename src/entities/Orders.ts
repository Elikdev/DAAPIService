import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";

@Index("orders_buyer_id_key", ["buyerId"], { unique: true })
@Index("orders_pkey", ["id"], { unique: true })
@Entity("orders", { schema: "public" })
export class Orders {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("integer", { name: "buyer_id", unique: true })
  buyerId: number;

  @Column("integer", { name: "seller_shop_id", nullable: true })
  sellerShopId: number | null;

  @Column("double precision", { name: "amount", nullable: true })
  amount: number | null;

  @Column("json", { name: "items", nullable: true })
  items: object | null;

  @Column("character varying", { name: "tracking_num", nullable: true })
  trackingNum: string | null;

  @Column("character varying", { name: "status", nullable: true })
  status: string | null;

  @Column("timestamp without time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("character varying", { name: "created_at", nullable: true })
  createdAt: string | null;

  @OneToMany(() => Items, (items) => items.order)
  items2: Items[];

  @ManyToOne(() => Users, (users) => users.orders)
  @JoinColumn([{ name: "seller_id", referencedColumnName: "id" }])
  seller: Users;
}
