import { AfterInsert, BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinTable } from "typeorm";
import { Users } from "./Users";

@Entity("user_relation")
export class UserRelations extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @ManyToOne(type => Users, user => user.followings)
  follower: Users;

  @ManyToOne(type => Users, user => user.followers)
  followee: Users;

  @CreateDateColumn({type: "timestamp"})
  createdAt: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: string;

  @AfterInsert()
  async updateFollowersAndFollowingsCount() {
    await Users.createQueryBuilder().update(Users)
      .set({followingsCount: this.follower.followingsCount + 1})
      .where("id = :id", { id: this.follower.id })
      .execute();

    await Users.createQueryBuilder().update(Users)
      .set({followersCount: this.followee.followersCount + 1})
      .where("id = :id", { id: this.followee.id })
      .execute();
  }
}
