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