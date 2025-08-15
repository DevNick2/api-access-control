import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsString } from "class-validator";
import * as moment from "moment";
import { TimeSpanWeekday } from "src/entities/time_span.entity";

export class AccessRuleStoreDTO {
  @ApiProperty({
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(TimeSpanWeekday, {
    each: true
  })
  weekday: TimeSpanWeekday[];

  @ApiProperty({
    required: true,
    example: '09:00'
  })
  @IsString()
  @Transform(({ value }) => moment(value, 'HH:mm', true), { toClassOnly: true })
  start_time: moment.Moment; // "08:00"

  @ApiProperty({
    required: true,
    example: '17:00'
  })
  @IsString()
  @Transform(({ value }) => moment(value, 'HH:mm', true), { toClassOnly: true })
  end_time: moment.Moment;   // "17:00"
}