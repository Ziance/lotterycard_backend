import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity()
export class UserBidHistory {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  
  @Column()
  bidStatus: boolean;


  @Column({ type: "text" })
  bidCard: string;


  @Column({ type: "text" })
  winnerCard: string;

}
