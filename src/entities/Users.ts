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
  UpdateDateColumn
} from "typeorm";
import { Orders } from "./Orders";
import { Shops } from "./Shops";
import { Addresses } from "./Addresses";
import { ItemSaves } from "./ItemSaves";
import { ItemLikes } from "./ItemLikes";
import { UserRelations } from "./UserRelations";

@Index("users_pkey", ["id"], { unique: true })
@Entity("users")
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("character varying", {nullable: true })
  openId: string;

  @Column()
  username: string;

  @Column({default: false})
  isSeller: boolean;

  @Column("character varying", {nullable: false })
  mobilePrefix: string;

  @Column("character varying", {nullable: false })
  mobile: string;

  @Column("character varying", {nullable: true })
  role: string | null;

  @Column("character varying", {nullable: true })
  introduction: string | null;

  @Column("character varying", {nullable: true })
  avatarUrl: string | null;

  @OneToMany(() => Orders, (orders) => orders.buyer)
  buyerOrders: Orders[];

  @OneToMany(() => Shops, (shops) => shops.owner, { cascade: true })
  @JoinColumn()
  shops: Shops[];

  @OneToMany(() => Addresses, addresses => addresses.user, { cascade: true })
  addresses: Addresses[];

  @OneToOne(() => Addresses, {nullable: true })
  @JoinColumn()
  defaultAddress: Addresses | null;

  @OneToMany(() => ItemSaves, (itemSaves) => itemSaves.user, { cascade: true })
  itemSaves: ItemSaves[];

  @OneToMany(() => ItemLikes, (itemLikes) => itemLikes.user, { cascade: true })
  itemLikes: ItemLikes[];

  @OneToMany(type => UserRelations, userRelations => userRelations.follower)
  followings: UserRelations[];

  @OneToMany(type => UserRelations, userRelations => userRelations.followee)
  followers: UserRelations[];

  @Column({default: 0})
  followingsCount: number;

  @Column({default: 0})
  followersCount: number;

  @CreateDateColumn({type: "timestamp"})
  createdAt: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: string;
}
