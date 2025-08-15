import { Entity, JoinColumn, OneToOne } from "typeorm";
import CustomBaseEntity from "./base.entity";
import { AccessRule } from "./access_rule.entity";
import { TimeZone } from "./time_zone.entity";

@Entity()
export class AccessRuleTimeZone extends CustomBaseEntity {
  @OneToOne(() => AccessRule, { cascade: false, nullable: false })
  @JoinColumn({ name: 'access_rule_id', referencedColumnName: 'id' })
  access_rule: AccessRule
  
  @OneToOne(() => TimeZone, { cascade: false, nullable: false })
  @JoinColumn({ name: 'time_zone_id', referencedColumnName: 'id' })
  time_zone: TimeZone
}