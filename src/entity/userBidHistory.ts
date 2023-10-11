import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity()
export class UserBidHistory {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  sessionId : number;

  @Column()
  userId?: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date: Date;

  @Column({ type: "text" })
  bidCard: string;
}
