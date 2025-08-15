import { Entity, JoinColumn, OneToOne } from "typeorm";
import CustomBaseEntity from "./base.entity";
import { AccessRule } from "./access_rule.entity";
import { Person } from "./person.entity";

@Entity()
export class PersonAccessRule extends CustomBaseEntity {
  @OneToOne(() => AccessRule, { cascade: false, nullable: false })
  @JoinColumn({ name: 'access_rule_id', referencedColumnName: 'id' })
  access_rule: AccessRule
  
  @OneToOne(() => Person, { cascade: false, nullable: false })
  @JoinColumn({ name: 'person_id', referencedColumnName: 'id' })
  person: Person
}