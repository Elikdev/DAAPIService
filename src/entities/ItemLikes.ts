import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Items } from "./Items";

@Entity("item_likes")
export class ItemLikes extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @Column("integer", {nullable: true })
  likedBy: number | null;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Items)
  item: Items;
}
