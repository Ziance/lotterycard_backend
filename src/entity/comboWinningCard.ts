import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class comboWinningCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  spadesBidCard: string;
  
  @Column({ type: "text" })
  diamondBidCard: string;
  
  @Column({ type: "text" })
  clubsBidCard: string;
  
  @Column({ type: "text" })
  heartsBidCard: string;

  @Column()
  sessionId : number;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  public created_at: Date;
}
