import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";
@Entity()
export class ComboBids {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    userId?: string;
    
    @Column({ type: "text" })
    spadesBidCard: string;
    
    @Column({ type: "text" })
    diamondBidCard: string;
    
    @Column({ type: "text" })
    clubsBidCard: string;
    
    @Column({ type: "text" })
    heartsBidCard: string;
    
    @Column({ type: "text" })
    sessionId: string;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;
}