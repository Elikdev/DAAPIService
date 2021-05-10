import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Items } from "./Items";

@Entity("item_comments")
export class ItemComments {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @Column("integer", {nullable: true })
  commentedBy: number | null;

  @Column("character varying", {nullable: true })
  content: string | null;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Items)
  item: Items;
}
