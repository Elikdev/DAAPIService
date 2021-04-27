import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Product {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column("text")
    description: string;

    @Column()
    type: string;

    @Column("float")
    ratingScore: number;

    @Column("float")
    abv: number
}
