import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import CustomBaseEntity from "./base.entity";
import { User } from './user.entity';

export enum RolesList {
  CAN_READ_PEOPLE = 'can_read_people',
  CAN_WRITE_PEOPLE = 'can_write_people',
  CAN_READ_DEVICES = 'can_read_devices',
  CAN_WRITE_DEVICES = 'can_write_devices',
  CAN_READ_ACCESS_RULES = 'can_read_access_rules',
  CAN_WRITE_ACCESS_RULES = 'can_write_access_rules',
  CAN_READ_COMPANY_DASHBOARD = 'can_read_company_dashboard'
}

@Entity()
export class Role extends CustomBaseEntity {
  @Column({ type: "boolean", default: false, nullable: true })
  can_read_people?: boolean
  @Column({ type: "boolean", default: false, nullable: true })
  can_write_people?: boolean
  @Column({ type: "boolean", default: false, nullable: true })
  can_read_devices?: boolean
  @Column({ type: "boolean", default: false, nullable: true })
  can_write_devices?: boolean
  @Column({ type: "boolean", default: false, nullable: true })
  can_read_access_rules?: boolean
  @Column({ type: "boolean", default: false, nullable: true })
  can_write_access_rules?: boolean
  @Column({ type: "boolean", default: false, nullable: true })
  can_read_company_dashboard?: boolean
}