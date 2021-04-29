import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Items } from "./Items";
import { ShopFollowers } from "./ShopFollowers";
import { Users } from "./Users";

@Index("shops_pkey", ["id"], { unique: true })
@Entity("shops", { schema: "public" })
export class Shops {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("character varying", {nullable: true })
  name: string | null;

  @Column("character varying", {nullable: true })
  introduction: string | null;

  @Column("character varying", {nullable: true })
  location: string | null;

  @Column("character varying", {nullable: true })
  reviewStar: string | null;

  @Column("character varying", {nullable: true })
  logoUrl: string | null;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;

  @Column("character varying", {nullable: true })
  comissionRate: string | null;

  @OneToMany(() => Items, (items) => items.shop)
  items: Items[];

  @OneToMany(() => ShopFollowers, (shopFollowers) => shopFollowers.shop)
  shopFollowers: ShopFollowers[];

  @ManyToOne(() => Users, (users) => users.shops)
  @JoinColumn([{referencedColumnName: "id" }])
  owner: Users;
}
