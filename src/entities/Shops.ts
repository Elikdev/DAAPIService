import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
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

@Index("shops_pkey", ["id"], { unique: true })
@Entity("shops")
export class Shops extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("character varying", {nullable: false })
  name: string | null;

  @Column("character varying", {nullable: true })
  introduction: string | null;

  @OneToOne(() => Addresses)
  @JoinColumn()
  address: Addresses;

  @Column("character varying", {nullable: true })
  reviewStar: string | null;

  @Column("character varying", {nullable: true })
  logoUrl: string | null;

  @Column("character varying", {nullable: true })
  comissionRate: string | null;

  @OneToMany(() => Items, (items) => items.shop, { cascade: true })
  items: Items[];

  @ManyToOne(() => Users, (users) => users.shops)
  owner: Users;

  @CreateDateColumn({type: "timestamp"})
  createdAt: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: string;
}
