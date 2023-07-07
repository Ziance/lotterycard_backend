import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity()
export class Bid {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ type: "text" })
  unicode: string;
}
