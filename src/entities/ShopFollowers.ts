import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Shops } from "./Shops";

@Entity("shop_followers", { schema: "public" })
export class ShopFollowers {
  @PrimaryGeneratedColumn("uuid")
  followerId: string;

  @ManyToOne(() => Shops, (shops) => shops.shopFollowers)
  @JoinColumn([{referencedColumnName: "id" }])
  shop: Shops;
}
