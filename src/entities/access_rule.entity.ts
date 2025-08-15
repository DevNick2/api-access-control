import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import CustomBaseEntity from "./base.entity";
import { Company } from "./company.entity";

export enum AccessRuleType {
  PERMISSION = 1
}

@Entity()
export class AccessRule extends CustomBaseEntity {
  @ManyToOne(() => Company, (company) => company.access_rule, { cascade: false, nullable: false })
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company: Company

  @Column({ type: 'enum', enum: AccessRuleType, default: AccessRuleType.PERMISSION, nullable: false })
  type: AccessRuleType
  
  @Column({ type: 'int', default: 0, nullable: false })
  priority: number
}