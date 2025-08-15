import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Company } from "./company.entity";
import { User } from "./user.entity";
import CustomBaseEntity from "./base.entity";

export enum PersonType {
  EMPLOYEE = 'employee',
  VISITOR = 'visitor',
  SERVICE_PROVIDER = 'service_provider'
}

@Entity()
export class Person extends CustomBaseEntity {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  registration: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;
  
  @Column({ type: 'varchar', nullable: false })
  photo_url: string;
  
  @Column({ type: 'enum', enum: PersonType, nullable: false })
  person_type: PersonType;
  
  @Column({ type: 'boolean', nullable: false })
  is_active: boolean;

  @ManyToOne(() => Company, (company) => company.person, { cascade: false, nullable: false })
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company: Company
  
  @ManyToOne(() => User, (user) => user.person, { cascade: false, nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User
}