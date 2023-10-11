import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: string;

  @Column({ type: "varchar", length: 200 })
  firstName: string;

  @Column({ type: "varchar", length: 200 })
  lastName: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  phone: string;

  @Column({ type: "varchar", length: 200, nullable: false })
  address: string;

  @Column({ unique: true, nullable: false })
  userName: string;

  @Column({ name: "email" })
  @IsEmail({}, { message: "Incorrect email" })
  @IsNotEmpty({ message: "The email is required" })
  email!: string;

  @Column()
  @IsNotEmpty({ message: "The password is required" })
  passwordHash: string;

  @Column({ default: 1 })
  isActive: boolean;

  @Column({ type: "bigint", nullable: true })
  createdBy?: number;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  public created_at: Date;

  @Column({ nullable: true, type: "bigint" })
  updatedBy?: number;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  public updated_at: Date;

  @Column()
  credits?:number

  @Column({ default: false })
  isDeleted: boolean;

  @Column({nullable: true, default: 0})
  retryCount?: number;
}
