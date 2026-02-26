import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('enrollments')
@Index(['tenantId', 'userId', 'courseId'], { unique: true })
export class EnrollmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  courseId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}