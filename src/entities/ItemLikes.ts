import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Items } from "./Items";

@Entity("item_likes", { schema: "public" })
export class ItemLikes {
  @PrimaryColumn("uuid", { name: "id" })
  id: string | null;

  @Column("integer", { name: "liked_by", nullable: true })
  likedBy: number | null;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Items, (items) => items.itemLikes)
  @JoinColumn([{ name: "item_id", referencedColumnName: "id" }])
  item: Items;
}
