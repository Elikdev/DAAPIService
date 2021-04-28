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
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", nullable: true })
  name: string | null;

  @Column("character varying", { name: "introduction", nullable: true })
  introduction: string | null;

  @Column("character varying", { name: "location", nullable: true })
  location: string | null;

  @Column("character varying", { name: "review_star", nullable: true })
  reviewStar: string | null;

  @Column("character varying", { name: "logo_url", nullable: true })
  logoUrl: string | null;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @Column("character varying", { name: "comission_rate", nullable: true })
  comissionRate: string | null;

  @OneToMany(() => Items, (items) => items.shop)
  items: Items[];

  @OneToMany(() => ShopFollowers, (shopFollowers) => shopFollowers.shop)
  shopFollowers: ShopFollowers[];

  @ManyToOne(() => Users, (users) => users.shops)
  @JoinColumn([{ name: "owner_id", referencedColumnName: "id" }])
  owner: Users;
}
