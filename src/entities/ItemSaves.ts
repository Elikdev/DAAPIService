import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Items } from "./Items";

@Entity("item_saves", { schema: "public" })
export class ItemSaves {
  @PrimaryColumn("uuid", { name: "id" })
  id: string | null;

  @Column("integer", { name: "saved_by", nullable: true })
  savedBy: number | null;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Items, (items) => items.itemSaves)
  @JoinColumn([{ name: "item_id", referencedColumnName: "id" }])
  item: Items;
}
