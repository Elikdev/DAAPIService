import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne
} from "typeorm";
import { Users } from "./Users";


@Entity("coupons")
export class Coupons extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  code: string;

  @Column("bool", {default: false })
  isValid: boolean;

  @Column("bool", {default: false })
  applied: boolean;

  @Column("character varying", { array: true, nullable: true})
  metadata: string[] | null;

  @ManyToOne(() => Users, (users) => users.coupons)
  owner: Users;


  @Column({type: "timestamp"})
  expireTime: string;

  @CreateDateColumn({type: "timestamp"})
  createdtime: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedtime: string;

}
