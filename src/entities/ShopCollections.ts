import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Shops } from "./Shops";
import { Coupons } from "./Coupons";

@Entity("shop_collections")
export class ShopCollections extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("bool", { default: false })
  isSuspended: boolean;

  @Column("character varying", { nullable: true })
  type: string | null;

  @Column("character varying", { nullable: true })
  coverImageUrl: string | null;

  @Column("character varying", { nullable: true })
  h5Url: string | null;

  @Column("character varying", { nullable: true })
  h5Name: string | null;

  @Column("bool", { default: false })
  h5LoginRequired: boolean;

  @Column("character varying", { nullable: true })
  h5CoverImageUrl: string | null;

  @Column({ default: 0 })
  order: number;

  @Column({ type: "timestamp" })
  endTime: string;

  @CreateDateColumn({ type: "timestamp" })
  createdtime: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedtime: string;

  @OneToMany(() => Coupons, (coupons) => coupons.collection, { cascade: true })
  coupons: Coupons[];

  @ManyToMany(() => Shops, (shops) => shops.shopCollections)
  @JoinTable()
  shops: Shops[];
}
