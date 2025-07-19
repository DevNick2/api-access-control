import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { RolesList } from 'src/entities/role.entity';
import { UserProfile } from 'src/entities/user.entity';

export class LoginDTO {
  @ApiProperty({
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  password: string;
}
export class UserShowDTO {
  @ApiProperty({
    required: true,
  })
  @IsUUID('4')
  code: string;
}

export class UserShowByEmailDTO {
  @ApiProperty({
    required: true,
  })
  @IsEmail()
  email: string;
}
export class UserStoreDTO {
  @ApiProperty({
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
  })
  @IsEnum(UserProfile, {
    each: true
  })
  profile: Exclude<UserProfile, 'admin'>;

  @ApiProperty({
    required: true,
  })
  @IsString()
  password: string;

  @ApiProperty({
    required: false,
  })

  @ValidateIf(o => o.profile === UserProfile.USER)
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(RolesList, {
    each: true
  })
  roles?: RolesList[]
}
export class UserUpdateDTO {
  @ApiProperty({
    required: false,
  })
  @IsEmail()
  email?: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  password?: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  document?: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  phone?: string;

  @IsString()
  refresh_token?: string;

  @IsNumber()
  otp?: number;

  @IsDate()
  otp_expires?: Date;

  @IsBoolean()
  verified?: boolean;
}
export class PasswordResetDTO {
  @ApiProperty({
    required: true,
  })
  @IsString()
  new_password: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  confirm_password: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  otp: number;
}
export class PasswordOtpDTO extends UserShowByEmailDTO {}
export class VerifyOtpDTO {
  @IsNumber()
  @ApiProperty({
    required: false,
  })
  otp: number;
}
