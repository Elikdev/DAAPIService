import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Shops } from "./Shops";

@Entity("shop_followers", { schema: "public" })
export class ShopFollowers {
  @PrimaryColumn("integer", { name: "follower_id" })
  followerId: number | null;

  @ManyToOne(() => Shops, (shops) => shops.shopFollowers)
  @JoinColumn([{ name: "shop_id", referencedColumnName: "id" }])
  shop: Shops;
}
