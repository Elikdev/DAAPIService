import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Users } from "./Users";

export enum ManualAuditStatus {
  PENDING = "pending",
  PASS = "pass",
  FAIL = "fail",
}

@Entity("PendingShops")
export class PendingShops extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("character varying", { nullable: true })
  introduction: string | null;

  @Column("character varying", { nullable: true })
  location: string;

  @Column("character varying", { nullable: true })
  redbookName: string;

  @Column("character varying", { nullable: true })
  wechatId: string;

  @ManyToOne(() => Users, (users) => users.pendingShops)
  owner: Users;

  @CreateDateColumn({ type: "timestamp" })
  createdtime: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedtime: string;

  @Column({
    type: "enum",
    enum: ManualAuditStatus,
    default: ManualAuditStatus.PENDING,
  })
  manualAuditStatus: string;
}