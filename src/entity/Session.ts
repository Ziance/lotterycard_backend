import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: number;

  @Column({ type: "timestamp" , default:null})
  sessionStartTime: Date;


  @Column({ type: "timestamp" , default:null})
  sessionEndTime: Date;

  @Column({ type: "boolean", default: true })
  allowBid: boolean;
}
