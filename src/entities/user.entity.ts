import { Entity, Column, ManyToMany, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import CustomBaseEntity from './base.entity';
import { Role } from './role.entity';
import { Company } from './company.entity';
import { Person } from './person.entity';

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

  @OneToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  roles?: Role

  get active_roles(): string[] {
    if (!this.roles) return []

    let arrRoles: string[] = []

    for (const roleKey in this.roles) {
      if (this.roles[roleKey]) arrRoles.push(roleKey)
    }

    return arrRoles
  }

  @ManyToOne(() => Company, (company) => company.user, { cascade: false, nullable: true })
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company?: Company
  
  @OneToMany(() => Person, (person) => person.user, { cascade: false, nullable: true })
  person?: Person

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at?: Date

  @Column({ type: 'int', nullable: true })
  otp_code?: number
  
  @Column({ type: 'timestamptz', nullable: true })
  otp_code_expires_at?: Date
}
