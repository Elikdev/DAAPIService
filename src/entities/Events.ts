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
import { Shops } from "./Shops";

@Entity("Events")
export class Events extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToMany(() => Shops, (shops) => shops.events)
  @JoinTable()
  shops: Shops[];

  @Column()
  name: string;

  @Column()
  title: string;

  @Column()
  subTitle: string;

  @Column()
  bannerImage: string;

  @Column()
  backgroundColor: string;

  @ManyToMany(() => Items, (items) => items.events)
  @JoinTable()
  items: Items[];

  @Column({ type: "timestamp" })
  startTime: string;

  @Column({ type: "timestamp" })
  endTime: string;

  @CreateDateColumn({ type: "timestamp" })
  createdtime: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedtime: string;
}
