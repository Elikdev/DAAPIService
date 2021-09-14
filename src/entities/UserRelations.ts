import {
  AfterInsert,
  AfterRemove,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinTable,
} from "typeorm";
import { Users } from "./Users";

@Entity("user_relations")
export class UserRelations extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @ManyToOne((type) => Users, (user) => user.followings, { eager: true })
  follower: Users;

  @ManyToOne((type) => Users, (user) => user.followers, { eager: true })
  followee: Users;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: string;

  @AfterInsert()
  async afterInsertOperations(): Promise<void> {
    Users.createQueryBuilder()
      .update(Users)
      .set({ followingsCount: this.follower.followingsCount + 1 })
      .where("id = :id", { id: this.follower.id })
      .execute();

    Users.createQueryBuilder()
      .update(Users)
      .set({ followersCount: this.followee.followersCount + 1 })
      .where("id = :id", { id: this.followee.id })
      .execute();
  }

  @AfterRemove()
  async afterRemoveOperations(): Promise<void> {
    Users.createQueryBuilder()
      .update(Users)
      .set({ followingsCount: this.follower.followingsCount - 1 })
      .where("id = :id", { id: this.follower.id })
      .execute();

    Users.createQueryBuilder()
      .update(Users)
      .set({ followersCount: this.followee.followersCount - 1 })
      .where("id = :id", { id: this.followee.id })
      .execute();
  }
}
