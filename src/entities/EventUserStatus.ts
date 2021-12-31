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
  ManyToOne,
} from "typeorm";
import { Items } from "./Items";
import { Users } from "./Users";

export enum InviteStatus {
  INVITED = "invited",
  NOT_INVITED = "not_invited",
}

@Entity("event_user_status")
export class EventUserStatus extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Users, (users) => users.eventUserStatus)
  participant: Users;

  @Column()
  eventName: string;

  @Column({
    type: "enum",
    enum: InviteStatus,
    default: InviteStatus.NOT_INVITED,
  })
  inviteStatus: string;

  @Column()
  inviteCode: string;

  @Column({ nullable: true })
  invitedBy: number;

  @CreateDateColumn({ type: "timestamp" })
  createdtime: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedtime: string;
}
