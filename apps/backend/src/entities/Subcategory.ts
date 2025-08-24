import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Category } from './Category';

@Unique('uq_subcategory_cat_slug', ['categoryId', 'slug'])
@Entity('subcategories')
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  // FK to Category (slug)
  @Index()
  @Column({ type: 'varchar', length: 64 })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' })
  category: Category;

  // Subcategory slug (e.g., "homeToHome", "residential")
  @Column({ type: 'varchar', length: 128 })
  slug: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  icon: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => SubcategoryI18n, (i18n) => i18n.subcategory, {
    cascade: ['insert', 'update'],
  })
  i18n: SubcategoryI18n[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Unique('uq_subcategory_i18n', ['subcategory', 'locale'])
@Entity('subcategory_i18n')
export class SubcategoryI18n {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subcategory, (s) => s.i18n, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subcategoryId' })
  subcategory: Subcategory;

  @Column({ type: 'varchar', length: 8 })
  locale: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
