// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   Index,
// } from 'typeorm';

// /**
//  * Job entity for storing open-job information and any questionnaire payloads
//  * submitted from the frontend. Adjust column types (json/jsonb) to match your DB.
//  */
// @Entity('jobs')
// export class Job {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;

//   @Index()
//   @Column({ type: 'varchar', length: 200 })
//   title!: string;

//   // The description the company (and candidates) will see for the open job
//   @Column({ type: 'text' })
//   description!: string;

//   // Optional longer internal/notes description that only admins see
//   @Column({ type: 'text', nullable: true })
//   internalNotes?: string | null;

//   // Optional location string (city, remote, etc.)
//   @Column({ type: 'varchar', length: 150, nullable: true })
//   location?: string | null;

//   // Store the questionnaire schema/fields presented to candidates (JSON)
//   @Column({ type: 'json', nullable: true })
//   questionnaire?: Record<string, unknown> | null;

//   // Optionally store aggregated candidate responses or a summary (JSON).
//   // For individual candidate responses, prefer a separate Applications table.
//   @Column({ type: 'json', nullable: true })
//   questionnaireResponsesSummary?: Record<string, unknown> | null;

//   // Reference to owning company (UUID). Create a relation if you have a Company entity.
//   @Index()
//   @Column({ type: 'uuid', nullable: true })
//   companyId?: string | null;

//   // Whether this job is visible on the public listing
//   @Column({ type: 'boolean', default: false })
//   published!: boolean;

//   @CreateDateColumn()
//   createdAt!: Date;

//   @UpdateDateColumn()
//   updatedAt!: Date;
// }

// export default Job;
