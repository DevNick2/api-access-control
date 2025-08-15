import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import CustomBaseEntity from "./base.entity";
import { Company } from "./company.entity";

@Entity()
export class TimeZone extends CustomBaseEntity {
  @ManyToOne(() => Company, (company) => company.time_zone, { cascade: false, nullable: false })
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company: Company

  @Column({ type: 'varchar', nullable: false })
  name: string
}