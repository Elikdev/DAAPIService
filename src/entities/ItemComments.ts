import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Items } from "./Items";

@Entity("item_comments", { schema: "public" })
export class ItemComments {
  @PrimaryColumn("uuid", { name: "id" })
  id: string | null;

  @Column("integer", { name: "commented_by", nullable: true })
  commentedBy: number | null;

  @Column("character varying", { name: "content", nullable: true })
  content: string | null;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Items, (items) => items.itemComments)
  @JoinColumn([{ name: "item_id", referencedColumnName: "id" }])
  item: Items;
}
