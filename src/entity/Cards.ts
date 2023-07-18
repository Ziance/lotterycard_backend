import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity()
export class Cards {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  card_name?: string;

  // @Column({type:"blob"})
  // card_type: Buffer;

}
