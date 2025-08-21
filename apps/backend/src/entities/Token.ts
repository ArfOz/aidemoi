import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'token' })
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, length: 512 })
  token: string;

  @Column({ type: 'varchar', unique: true, length: 512 })
  refreshToken: string;

  // Ensure one row per user
  @Column({ type: 'int', unique: true })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAtToken: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAtRefresh: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
