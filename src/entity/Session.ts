import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  seesionId: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  sessionStartTime: Date;

  @Column({ type: "timestamp" })
  sessionEndTime: Date;

  @Column({ type: "boolean", default: true })
  allowBid: boolean;
}
