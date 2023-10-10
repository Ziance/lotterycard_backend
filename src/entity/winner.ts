import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Winner {
  @PrimaryGeneratedColumn()
  id: number;

   @Column()
   userId : string;

  @Column()
  sessionId : number;

  @Column()
  winners:string;

  @Column()
  winnerBidCard:string;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  public created_at: Date;
}
