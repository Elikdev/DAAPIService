import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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

  @Column("character varying", {nullable: false })
  mobile: string;

  @ManyToOne(() => Users, user => user.addresses)
  user: Users;

  @Column("boolean", {default: true })
  isActive: boolean;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;
}