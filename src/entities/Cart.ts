
import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";

@Entity("carts")
export class Carts extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToMany(() => Items, items => items.carts)
  @JoinTable()
  items: Items[];

  @OneToOne(() => Users, owner => owner.cart)
  @JoinColumn()
  owner: Users;
  
  @CreateDateColumn({type: "timestamp"})
  createdtime: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedtime: string;
}
