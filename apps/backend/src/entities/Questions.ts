import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  ManyToOne,
  OneToMany,
  JoinColumn,
  JoinColumns,
} from 'typeorm';
import { Category } from './Category';
import { Subcategory } from './Subcategory';

// Core types supported by frontend
export type QuestionType =
  | 'single'
  | 'multi'
  | 'text'
  | 'number'
  | 'date'
  | 'time'
  | 'select';

/**
 * Base question definition (non-localized).
 * Unique by (categoryId, subcategoryId, questionId).
 * Localized texts live in QuestionI18n; options live in QuestionOption (+ QuestionOptionI18n).
 */
@Index(['categoryId', 'subcategoryId'])
@Unique('uq_question_key', ['categoryId', 'subcategoryId', 'questionId'])
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  categoryId: string;

  @Column({ type: 'varchar', length: 128 })
  subcategoryId: string;

  // The question "id" from en.json/fr.json
  @Column({ type: 'varchar', length: 128 })
  questionId: string;

  @Column({ type: 'varchar', length: 16 })
  type: QuestionType;

  @Column({ type: 'boolean', default: false })
  required: boolean;

  // Numeric constraints for number questions
  @Column({ type: 'float', nullable: true })
  min: number | null;

  @Column({ type: 'float', nullable: true })
  max: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  unit: string | null;

  // Allow "Other" for single/multi
  @Column({ type: 'boolean', default: false })
  allowOther: boolean;

  // Render order within a subcategory
  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => QuestionI18n, (i18n) => i18n.question, {
    cascade: ['insert', 'update'],
  })
  i18n: QuestionI18n[];

  @OneToMany(() => QuestionOption, (opt) => opt.question, {
    cascade: ['insert', 'update'],
  })
  options: QuestionOption[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Link to Category by slug (categoryId)
  @ManyToOne(() => Category, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' })
  category?: Category | null;

  // Link to Subcategory by composite (categoryId + slug)
  @ManyToOne(() => Subcategory, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumns([
    { name: 'categoryId', referencedColumnName: 'categoryId' },
    { name: 'subcategoryId', referencedColumnName: 'slug' },
  ])
  subcategory?: Subcategory | null;
}

/**
 * Localized texts for a question.
 * Unique by (questionId, locale).
 */
@Unique('uq_question_i18n', ['question', 'locale'])
@Entity('question_i18n')
export class QuestionI18n {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (q) => q.i18n, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'varchar', length: 8 })
  locale: string; // e.g. 'en', 'fr', 'tr'

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'text', nullable: true })
  helpText: string | null;

  @Column({ type: 'text', nullable: true })
  placeholder: string | null;

  @Column({ type: 'text', nullable: true })
  otherLabel: string | null; // if allowOther is true
}

/**
 * Non-localized option row per question.
 * Unique by (question, value). Labels live in QuestionOptionI18n.
 */
@Index(['question'])
@Unique('uq_question_option_val', ['question', 'value'])
@Entity('question_options')
export class QuestionOption {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (q) => q.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  // The "value" from en.json/fr.json
  @Column({ type: 'varchar', length: 128 })
  value: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => QuestionOptionI18n, (i18n) => i18n.option, {
    cascade: ['insert', 'update'],
  })
  i18n: QuestionOptionI18n[];
}

/**
 * Localized labels for an option.
 * Unique by (optionId, locale).
 */
@Unique('uq_question_option_i18n', ['option', 'locale'])
@Entity('question_option_i18n')
export class QuestionOptionI18n {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QuestionOption, (opt) => opt.i18n, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'optionId' })
  option: QuestionOption;

  @Column({ type: 'varchar', length: 8 })
  locale: string;

  @Column({ type: 'text' })
  label: string;
}
