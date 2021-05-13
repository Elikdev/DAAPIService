import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("followers")
export class Followers extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @Column("integer", {nullable: true })
  followerId: number | null;

  @Column("integer", {nullable: true })
  followeeId: number | null;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;
}
