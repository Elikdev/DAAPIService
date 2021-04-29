import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Items } from "./Items";

@Entity("item_saves", { schema: "public" })
export class ItemSaves {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @Column("integer", {nullable: true })
  savedBy: number | null;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Items, (items) => items.itemSaves)
  @JoinColumn([{referencedColumnName: "id" }])
  item: Items;
}
