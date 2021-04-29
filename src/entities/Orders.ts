import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";

@Index("orders_buyer_id_key", ["buyerId"], { unique: true })
@Index("orders_pkey", ["id"], { unique: true })
@Entity("orders", { schema: "public" })
export class Orders {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("integer", {unique: true })
  buyerId: number;

  @Column("integer", {nullable: true })
  sellerShopId: number | null;

  @Column("double precision", {nullable: true })
  amount: number | null;

  @Column("json", {nullable: true })
  itemsJson: object | null;

  @Column("character varying", {nullable: true })
  trackingNum: string | null;

  @Column("character varying", {nullable: true })
  status: string | null;

  @Column("timestamp without time zone", {nullable: true })
  updatedAt: Date | null;

  @Column("character varying", {nullable: true })
  createdAt: string | null;

  @OneToMany(() => Items, (items) => items.order)
  orderItems: Items[];

  @ManyToOne(() => Users, (users) => users.orders)
  @JoinColumn([{referencedColumnName: "id" }])
  seller: Users;
}
