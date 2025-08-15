import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";
import { PersonType } from "src/entities/person.entity";
export class PersonCodeDTO {
  @IsUUID('4')
  @IsOptional()
  person_code?: string
}
export class PersonStoreDTO {
  @ApiProperty({
    required: true,
  })
  @IsString()
  name: string;
  
  @ApiProperty({
    required: true,
  })
  @IsString()
  registration: string;

  @ApiProperty({
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
  
  @ApiProperty({
    required: true,
  })
  @IsUrl()
  photo_url: string;
  
  @ApiProperty({
    required: true,
  })
  @IsEnum(PersonType)
  person_type: PersonType;
}