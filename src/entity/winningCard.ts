import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class winningCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  winnerCard : string;

  @Column()
  sessionId : number;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  public created_at: Date;
}
