import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Orders } from "./Orders";
import { Shops } from "./Shops";
import { Addresses } from "./Addresses";
import { ItemSaves } from "./ItemSaves";
import { Coupons } from "./Coupons";
import { ItemLikes } from "./ItemLikes";
import { UserRelations } from "./UserRelations";
import { RecentlyViewed } from "./RecentlyViewed";
import { Carts } from "./Cart";

export enum UserRole {
  SHOPPER = "shopper",
  SELLER = "seller",
}

export enum Platform {
  APP = "app",
  MINIPROGRAM = "miniprogram",
}

@Index("users_pkey", ["id"], { unique: true })
@Entity("users")
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("character varying", { nullable: true })
  openId: string;

  @Column({
    type: "enum",
    enum: Platform,
    default: Platform.MINIPROGRAM,
  })
  platform: string;

  @Column("character varying", { nullable: true })
  unionId: string;

  @Column("double precision", { nullable: true })
  sex: number;

  @Column()
  username: string;

  @Column("character varying", { nullable: true })
  mobilePrefix: string;

  @Column("character varying", { nullable: true })
  mobile: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.SHOPPER,
  })
  role: string;

  @Column("character varying", { nullable: true })
  introduction: string | null;

  @Column("character varying", { nullable: true })
  avatarUrl: string | null;

  @OneToMany(() => Orders, (orders) => orders.buyer)
  buyerOrders: Orders[];

  @OneToMany(() => Shops, (shops) => shops.owner, { cascade: true })
  @JoinColumn()
  shops: Shops[];

  @OneToMany(() => Coupons, (coupons) => coupons.owner, { cascade: true })
  coupons: Coupons[];

  @OneToMany(() => RecentlyViewed, (recentlyViewed) => recentlyViewed.owner, {
    cascade: true,
  })
  recentlyViewed: RecentlyViewed[];

  @OneToMany(() => Addresses, (addresses) => addresses.user, { cascade: true })
  addresses: Addresses[];

  @OneToOne(() => Addresses, { nullable: true })
  @JoinColumn()
  defaultAddress: Addresses | null;

  @OneToOne(() => Carts, (cart) => cart.owner, { nullable: true })
  cart: Carts;

  @OneToMany(() => ItemSaves, (itemSaves) => itemSaves.user, { cascade: true })
  itemSaves: ItemSaves[];

  @OneToMany(() => ItemLikes, (itemLikes) => itemLikes.user, { cascade: true })
  itemLikes: ItemLikes[];

  @OneToMany((type) => UserRelations, (userRelations) => userRelations.follower)
  followings: UserRelations[];

  @OneToMany((type) => UserRelations, (userRelations) => userRelations.followee)
  followers: UserRelations[];

  @Column({ default: 0 })
  followingsCount: number;

  @Column({ default: 0 })
  followersCount: number;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: string;
}
