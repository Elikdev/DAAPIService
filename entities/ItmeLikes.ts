import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Items } from "./Items";

@Entity("itme_likes", { schema: "public" })
export class ItmeLikes {
  @Column("integer", { name: "id", nullable: true })
  id: number | null;

  @Column("integer", { name: "liked_by", nullable: true })
  likedBy: number | null;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Items, (items) => items.itmeLikes)
  @JoinColumn([{ name: "item_id", referencedColumnName: "id" }])
  item: Items;
}
