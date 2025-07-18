import { Entity, Column } from 'typeorm';
import CustomBaseEntity from './base.entity';

export enum UserType {
  DIVER = 'diver',
  INSPECTOR = 'inspector',
  ADMIN = 'admin',
}

@Entity()
export class Users extends CustomBaseEntity {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: false,
  })
  type: UserType;

  @Column({
    type: 'bool',
    default: false,
  })
  verified: boolean;

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    transformer: {
      to(value?: string): string {
        return value ? value.replaceAll(/\W/g, '').trim() : null;
      },
      from(value: string): string {
        return value;
      },
    },
  })
  document?: string;

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to(value?: string): number {
        return value
          ? parseInt(value.toString().replaceAll(/\W/g, '').trim())
          : null;
      },
      from(value: number): number {
        return value;
      },
    },
  })
  phone?: string;

  @Column({ nullable: true })
  refresh_token?: string;

  @Column({ nullable: true, type: 'int' })
  otp?: number;

  @Column({ nullable: true, type: 'timestamptz' })
  otp_expires?: Date;
}
