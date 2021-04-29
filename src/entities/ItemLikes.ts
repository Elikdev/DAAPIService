import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Items } from "./Items";

@Entity("item_likes", { schema: "public" })
export class ItemLikes {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @Column("integer", {nullable: true })
  likedBy: number | null;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Items, (items) => items.itemLikes)
  @JoinColumn([{referencedColumnName: "id" }])
  item: Items;
}
