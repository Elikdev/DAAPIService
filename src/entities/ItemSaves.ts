import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Items } from "./Items";

@Entity("item_saves")
export class ItemSaves {
  @PrimaryGeneratedColumn("uuid")
  id: string | null;

  @Column("integer", {nullable: true })
  savedBy: number | null;

  @Column("timestamp without time zone", {nullable: true })
  createdAt: Date | null;

  @ManyToOne(() => Items)
  item: Items;
}
