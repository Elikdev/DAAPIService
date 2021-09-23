import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";
import { Shops } from "./Shops";

@Entity("Reviews")
export class Reviews extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("character varying", { nullable: true })
  review: string;

  @Column("double precision", { nullable: true })
  rating: number;

  @OneToMany(() => Items, (items) => items.review, { cascade: true })
  items: Items[];

  @ManyToOne(() => Users, (user) => user.reviews)
  reviewer: Users;

  @ManyToOne(() => Shops, (shop) => shop.reviews)
  shop: Shops;

  @Column("bool", { default: false })
  isSuspended: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: string;
}
