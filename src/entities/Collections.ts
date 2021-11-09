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
import { Items } from "./Items";
import { Coupons } from "./Coupons";

@Entity("collections")
export class Collections extends BaseEntity {
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

  @ManyToMany(() => Items, (items) => items.collections)
  @JoinTable()
  items: Items[];

  @OneToMany(() => Coupons, (coupons) => coupons.collection, { cascade: true })
  coupons: Coupons[];
}
