import { Column, Entity, JoinColumn, OneToMany } from "typeorm";
import CustomBaseEntity from "./base.entity";
import { User } from "./user.entity";
import { Device } from "./device.entity";

@Entity()
export class Company extends CustomBaseEntity {
  @OneToMany(() => User, (user) => user.company, { cascade: false, nullable: false })
  user: User

  @OneToMany(() => Device, (device) => device.company, { cascade: false, nullable: false })
  @JoinColumn({ name: 'device_id', referencedColumnName: 'id' })
  device: Device
  
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
  
  @Column({ type: 'varchar', nullable: true })
  logo_url?: string
  
  @Column({ type: 'varchar', nullable: true })
  primary_color?: string
}