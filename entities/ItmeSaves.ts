import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Items } from "./Items";

@Entity("itme_saves", { schema: "public" })
export class ItmeSaves {
  @Column("integer", { name: "id", nullable: true })
  id: number | null;

  @Column("integer", { name: "saved_by", nullable: true })
  savedBy: number | null;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Items, (items) => items.itmeSaves)
  @JoinColumn([{ name: "item_id", referencedColumnName: "id" }])
  item: Items;
}
