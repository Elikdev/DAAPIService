import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("increment")
  id: string;

  @Column({
    nullable: true,
    length: 150,
    unique: true,
  })
  openid: string;

  @Column()
  username: string;

  @Column()
  nickname: string;

  @Column()
  mobilePrefix: string;

  @Column()
  mobile: string;

  @Column({
    nullable: true
  })
  age: number;

  @CreateDateColumn({type: "timestamp"})
  createdAt: string;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: string;
}
