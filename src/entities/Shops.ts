import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Addresses } from "./Addresses";
import { Items } from "./Items";
import { Users } from "./Users";
import { Orders } from "./Orders";

@Entity("shops")
export class Shops extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("character varying", {nullable: true })
  introduction: string | null;

  @OneToMany(() => Orders, (orders) => orders.shop)
  shopOrders: Orders[];

  @Column("float", {default: 0.0 })
  rating: number;

  @Column("character varying", {nullable: true })
  logoUrl: string;

  @Column("character varying", {nullable: true })
  location: string;

  @Column("float", { default: 0.0})
  commissionRate: number;

  @OneToMany(() => Items, (items) => items.shop, { cascade: true })
  items: Items[];

  @ManyToOne(() => Users, (users) => users.shops)
  owner: Users;

  @CreateDateColumn({type: "timestamp"})
  createdtime: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedtime: string;
}
