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

  @Column({ default: 0 })
  order: number;

  @Column({ type: "timestamp" })
  endTime: string;

  @CreateDateColumn({ type: "timestamp" })
  createdtime: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedtime: string;

  @ManyToMany(() => Shops, (shops) => shops.shopCollections)
  @JoinTable()
  shops: Shops[];
}
