import {
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity('categories')
export class Category {
  // Use slug as the primary key (e.g., "moving", "cleaning")
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  icon: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => CategoryI18n, (i18n) => i18n.category, {
    cascade: ['insert', 'update'],
  })
  i18n: CategoryI18n[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Unique('uq_category_i18n', ['category', 'locale'])
@Entity('category_i18n')
export class CategoryI18n {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (c) => c.i18n, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' })
  category: Category;

  @Column({ type: 'varchar', length: 8 })
  locale: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
