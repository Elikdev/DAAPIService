import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";

@Entity("buyer_addresses")
export class BuyerAddresses {
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

  @ManyToOne(() => Users, (users) => users.buyer_addresses, {eager: true})
  buyer: Users;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;
}