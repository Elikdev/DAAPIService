import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Orders } from "./Orders";
import { Shops } from "./Shops";
import { ItemSaves } from "./ItemSaves";
import { ItemLikes } from "./ItemLikes";

@Index("items_pkey", ["id"], { unique: true })
@Entity("items")
export class Items extends BaseEntity {
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

  @Column("json", {nullable: true })
  imageUrls: object | null;

  @Column("character varying", {nullable: true })
  factoryDate: string | null;

  @Column("character varying", {nullable: true })
  description: string | null;

  @Column("character varying", {nullable: true })
  status: string | null;

  @CreateDateColumn({type: "timestamp"})
  createdAt: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: string;

  @ManyToOne(() => Orders)
  order: Orders;

  @ManyToOne(() => Shops)
  shop: Shops;

  @OneToMany(() => ItemSaves, (itemSaves) => itemSaves.item, { cascade: true })
  itemSaves: ItemSaves[];

  @OneToMany(() => ItemLikes, (itemLikes) => itemLikes.item, { cascade: true })
  itemLikes: ItemLikes[];

  @Column({default: 0})
  itemSavesCount: number;

  @Column({default: 0})
  itemLikesCount: number;
}
