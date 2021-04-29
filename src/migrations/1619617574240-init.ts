import {MigrationInterface, QueryRunner} from "typeorm";

export class init1619617574240 implements MigrationInterface {
    name = 'init1619617574240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "public"."item_likes" ("id" uuid NOT NULL, "liked_by" integer, "created_at" TIMESTAMP, "item_id" integer, CONSTRAINT "PK_2acbafd490e455de09046064be0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "public"."item_saves" ("id" uuid NOT NULL, "saved_by" integer, "created_at" TIMESTAMP, "item_id" integer, CONSTRAINT "PK_23dabed685ce244c26d0143434d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "public"."shop_followers" ("follower_id" integer NOT NULL, "shop_id" integer, CONSTRAINT "PK_27940fc87eb51b19bb063018185" PRIMARY KEY ("follower_id"))`);
        await queryRunner.query(`CREATE TABLE "public"."shops" ("id" SERIAL NOT NULL, "name" character varying, "introduction" character varying, "location" character varying, "review_star" character varying, "logo_url" character varying, "created_at" TIMESTAMP, "comission_rate" character varying, "owner_id" integer, CONSTRAINT "PK_6968a59d134c0bb0ae4d1fed0e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "shops_pkey" ON "public"."shops" ("id") `);
        await queryRunner.query(`CREATE TABLE "public"."users" ("id" SERIAL NOT NULL, "open_id" character varying, "full_name" character varying, "avatar" character varying, "phone" character varying, "email" character varying, "country" character varying, "zip_code" character varying, "province" character varying, "district" character varying, "city" character varying, "shop_id" character varying, "role" character varying, "created_at" TIMESTAMP, CONSTRAINT "PK_a6cc71bedf15a41a5f5ee8aea97" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "users_pkey" ON "public"."users" ("id") `);
        await queryRunner.query(`CREATE TABLE "public"."orders" ("id" uuid NOT NULL, "buyer_id" integer NOT NULL, "seller_shop_id" integer, "amount" double precision, "items" json, "tracking_num" character varying, "status" character varying, "updated_at" TIMESTAMP, "created_at" character varying, "seller_id" integer, CONSTRAINT "UQ_d750fa8106b44c82dfeeac2cc35" UNIQUE ("buyer_id"), CONSTRAINT "PK_171fc86d2df6b79ac4634d12b4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "orders_pkey" ON "public"."orders" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "orders_buyer_id_key" ON "public"."orders" ("buyer_id") `);
        await queryRunner.query(`CREATE TABLE "public"."items" ("id" integer NOT NULL, "name" character varying, "price" double precision, "condition" character varying, "color" character varying, "size" character varying, "description" character varying, "status" character varying, "created_at" TIMESTAMP, "order_id" uuid, "shop_id" integer, CONSTRAINT "PK_d32973b37cfbe9098d4722f564a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "items_pkey" ON "public"."items" ("id") `);
        await queryRunner.query(`CREATE TABLE "public"."item_comments" ("id" uuid NOT NULL, "commented_by" integer, "content" character varying, "created_at" TIMESTAMP, "item_id" integer, CONSTRAINT "PK_777f45ae1719d51b33b97110561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."item_likes" ADD CONSTRAINT "FK_b49f7b50cc2304614c9a6134af4" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."item_saves" ADD CONSTRAINT "FK_f09bcd30af1016f2aad030dfe1b" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."shop_followers" ADD CONSTRAINT "FK_a67639a4e54567a3fc97e461a39" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."shops" ADD CONSTRAINT "FK_0d408d5980a52761cd99d7635e2" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."orders" ADD CONSTRAINT "FK_5e422ed60d525325f6574e8fe21" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."items" ADD CONSTRAINT "FK_4ca1c0abe73aec131b082f4c56d" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."items" ADD CONSTRAINT "FK_c88e192462a5b0b82751fb860c5" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."item_comments" ADD CONSTRAINT "FK_65a1be45b26dc4731ec5f523480" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."item_comments" DROP CONSTRAINT "FK_65a1be45b26dc4731ec5f523480"`);
        await queryRunner.query(`ALTER TABLE "public"."items" DROP CONSTRAINT "FK_c88e192462a5b0b82751fb860c5"`);
        await queryRunner.query(`ALTER TABLE "public"."items" DROP CONSTRAINT "FK_4ca1c0abe73aec131b082f4c56d"`);
        await queryRunner.query(`ALTER TABLE "public"."orders" DROP CONSTRAINT "FK_5e422ed60d525325f6574e8fe21"`);
        await queryRunner.query(`ALTER TABLE "public"."shops" DROP CONSTRAINT "FK_0d408d5980a52761cd99d7635e2"`);
        await queryRunner.query(`ALTER TABLE "public"."shop_followers" DROP CONSTRAINT "FK_a67639a4e54567a3fc97e461a39"`);
        await queryRunner.query(`ALTER TABLE "public"."item_saves" DROP CONSTRAINT "FK_f09bcd30af1016f2aad030dfe1b"`);
        await queryRunner.query(`ALTER TABLE "public"."item_likes" DROP CONSTRAINT "FK_b49f7b50cc2304614c9a6134af4"`);
        await queryRunner.query(`DROP TABLE "public"."item_comments"`);
        await queryRunner.query(`DROP INDEX "public"."items_pkey"`);
        await queryRunner.query(`DROP TABLE "public"."items"`);
        await queryRunner.query(`DROP INDEX "public"."orders_buyer_id_key"`);
        await queryRunner.query(`DROP INDEX "public"."orders_pkey"`);
        await queryRunner.query(`DROP TABLE "public"."orders"`);
        await queryRunner.query(`DROP INDEX "public"."users_pkey"`);
        await queryRunner.query(`DROP TABLE "public"."users"`);
        await queryRunner.query(`DROP INDEX "public"."shops_pkey"`);
        await queryRunner.query(`DROP TABLE "public"."shops"`);
        await queryRunner.query(`DROP TABLE "public"."shop_followers"`);
        await queryRunner.query(`DROP TABLE "public"."item_saves"`);
        await queryRunner.query(`DROP TABLE "public"."item_likes"`);
    }

}
