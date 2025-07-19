import { Entity, Column, ManyToMany, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import CustomBaseEntity from './base.entity';
import { Role } from './role.entity';

export enum UserProfile {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

@Entity()
export class User extends CustomBaseEntity {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserProfile,
    nullable: false,
  })
  profile: UserProfile;

  @Column({ type: "boolean", nullable: false })
  is_temporary_password: boolean

  @OneToOne(() => Role, { nullable: true, cascade: false })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  roles?: Role

  // @ManyToOne(() => Company, (company) => company.user, { cascade: false, nullabel: true })
  // @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  // company: Company

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at?: Date

  @Column({ type: 'int', nullable: true })
  otp_code?: number
  
  @Column({ type: 'timestamptz', nullable: true })
  otp_code_expires_at?: Date
}
