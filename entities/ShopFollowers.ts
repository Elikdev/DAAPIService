import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Shops } from "./Shops";

@Entity("shop_followers", { schema: "public" })
export class ShopFollowers {
  @Column("integer", { name: "follower_id", nullable: true })
  followerId: number | null;

  @ManyToOne(() => Shops, (shops) => shops.shopFollowers)
  @JoinColumn([{ name: "shop_id", referencedColumnName: "id" }])
  shop: Shops;
}
