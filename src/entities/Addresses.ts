import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Shops } from "./Shops";
import { Users } from "./Users";
import { Orders } from "./Orders";

@Entity("addresses")
export class Addresses extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @Column("character varying", {nullable: false })
  fullName: string | null;

  @Column("character varying", {nullable: false })
  province: string | null;

  @Column("character varying", {nullable: false })
  city: string | null;

  @Column("character varying", {nullable: false })
  district: string | null;

  @Column("character varying", {nullable: false })
  street: string | null;

  @Column("character varying", {nullable: false })
  phoneNumber: string;

  @ManyToOne(() => Users, user => user.addresses)
  user: Users;

  @OneToMany(() => Orders, (orders) => orders.buyerAddress)
  orders: Orders[];

  @Column("boolean", {default: true })
  isActive: boolean;

  @CreateDateColumn({type: "timestamp"})
  createdAt: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: string;
}