import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Credit {

    @PrimaryGeneratedColumn()
    id?:string;

    @Column()
    userId?: string;

    @Column()
    credits?:number

}