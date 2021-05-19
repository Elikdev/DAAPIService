import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Shops } from "./Shops";
import { Users } from "./Users";

@Entity("addresses")
export class Addresses {
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

  @ManyToOne(() => Users, user => user.addresses)
  user: Users;

  @OneToOne(() => Shops)
  shop: Shops

  @Column("boolean", {default: true })
  isActive: boolean;

  @CreateDateColumn({type: "timestamp"})
  createdAt: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: string;
}