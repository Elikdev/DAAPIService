import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Items } from "./Items";

@Entity("itme_comments", { schema: "public" })
export class ItmeComments {
  @Column("integer", { name: "id", nullable: true })
  id: number | null;

  @Column("integer", { name: "commented_by", nullable: true })
  commentedBy: number | null;

  @Column("character varying", { name: "content", nullable: true })
  content: string | null;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Items, (items) => items.itmeComments)
  @JoinColumn([{ name: "item_id", referencedColumnName: "id" }])
  item: Items;
}
