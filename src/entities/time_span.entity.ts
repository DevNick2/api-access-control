import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import CustomBaseEntity from "./base.entity";
import { Company } from "./company.entity";
import { TimeZone } from "./time_zone.entity";
import * as moment from "moment";


export enum TimeSpanWeekday {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

@Entity()
export class TimeSpan extends CustomBaseEntity {  
  @OneToOne(() => TimeZone, { cascade: false, nullable: false })
  @JoinColumn({ name: 'time_zone_id', referencedColumnName: 'id' })
  time_zone: TimeZone

  @Column({ type: 'int', enum: TimeSpanWeekday, array: true, nullable: false })
  weekday: TimeSpanWeekday[]
  
  @Column({
    type: 'timetz',
    nullable: false,
    transformer: {
      to(value: moment.Moment): string {
        return value.format('HH:mm:ss')
      },
      from(value: Date): moment.Moment {
        return moment(value, 'HH:mm:ss')
      }
    }
  })
  start_time: Date
  
  @Column({
    type: 'timetz',
    nullable: false,
    transformer: {
      to(value: moment.Moment): string {
        return value.format('HH:mm:ss')
      },
      from(value: Date): moment.Moment {
        return moment(value, 'HH:mm:ss')
      }
    }
  })
  end_time: Date
}