import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsOptional, IsString, IsUUID } from "class-validator"
import { PartialType } from '@nestjs/mapped-types';

export class DeviceStoreDTO {
  @ApiProperty({
    required: true,
  })
  @IsString()
  name: string

  @ApiProperty({
    required: true,
  })
  @IsString()
  ip_address: string

  @ApiProperty({
    required: false,
  })
  @IsString()
  user: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  password: string;
}

export class DeviceShowDTO {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsUUID('4')
  device_code: string 
}

export class DeviceDeleteDTO extends DeviceShowDTO {}

export class DeviceUpdateDTO extends PartialType(DeviceStoreDTO) {
  @IsBoolean()
  @IsOptional()
  is_active?: boolean
}

// DTO para o ControlID
export type UserObjectDevice = {
  id: number
  registration: string
  name: string
  password?: string
  salt?: string
  user_type_id?: number
  begin_time?: number
  end_time?: number
  image_timestamp?: number
  last_access?: number
}