import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne
} from "typeorm";

import { Users } from "./Users";
import { Items } from "./Items";



@Entity("RecentlyViewed")
export class RecentlyViewed extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;


  @ManyToOne(() => Users, (users) => users.recentlyViewed)
  owner: Users;

  @ManyToOne(() => Items, (items) => items.recentlyViewed)
  item: Items;

  @CreateDateColumn({type: "timestamp"})
  createdtime: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedtime: string;


  @Column({default: 0})
  viewdCount: number;

}
