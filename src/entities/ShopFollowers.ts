import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Shops } from "./Shops";

@Entity("shop_followers")
export class ShopFollowers {
  @PrimaryGeneratedColumn("uuid")
  followerId: string;

  @ManyToOne(() => Shops)
  shop: Shops;
}
