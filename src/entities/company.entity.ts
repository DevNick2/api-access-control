import { Column, Entity, JoinColumn, OneToMany } from "typeorm";
import CustomBaseEntity from "./base.entity";
import { User } from "./user.entity";
import { Device } from "./device.entity";
import { Person } from "./person.entity";
import { AccessRule } from "./access_rule.entity";
import { TimeZone } from "./time_zone.entity";

@Entity()
export class Company extends CustomBaseEntity {
  @OneToMany(() => User, (user) => user.company, { cascade: true, nullable: false })
  user: User

  @OneToMany(() => Device, (device) => device.company, { cascade: true, nullable: false })
  @JoinColumn({ name: 'device_id', referencedColumnName: 'id' })
  device: Device

  @OneToMany(() => AccessRule, (access_rule) => access_rule.company, { cascade: true, nullable: true })
  access_rule?: AccessRule
  
  @OneToMany(() => TimeZone, (time_zone) => time_zone.company, { cascade: true, nullable: true })
  time_zone?: TimeZone
  
  @Column({ type: 'varchar', nullable: false })
  name: string

  @Column({
    type: 'varchar',
    nullable: false,
    transformer: {
      to(value: string): string {
        return value.replaceAll(/\D/g, '')
      },
      from(value: string): string {
        return value
      }
    }
  })
  cnpj: string

  @Column({
    type: 'varchar',
    nullable: false,
    transformer: {
      to(value: string): string {
        return value.replaceAll(' ', '_').toLowerCase()
      },
      from(value: string): string {
        return value
      }
    }
  })
  domain: string

  @OneToMany(() => Person, (person) => person.company, { cascade: true, nullable: true })
  person?: Person
  
  @Column({ type: 'varchar', nullable: true })
  logo_url?: string
  
  @Column({ type: 'varchar', nullable: true })
  primary_color?: string
}