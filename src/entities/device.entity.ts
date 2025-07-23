import { Column, Entity, ManyToOne } from "typeorm";
import CustomBaseEntity from "./base.entity";
import { Company } from "./company.entity";

@Entity()
export class Device extends CustomBaseEntity {
  @ManyToOne(() => Company, (company) => company.user, { cascade: false, nullable: false })
  company: Company

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
  ip_address: string

  @Column({ type: 'boolean', nullable: false })
  is_active: boolean

  @Column({ type: 'varchar', nullable: false })
  user: string

  @Column({ type: 'varchar', nullable: false })
  password: string

  @Column({ type: 'varchar', nullable: false })
  iv: string
}