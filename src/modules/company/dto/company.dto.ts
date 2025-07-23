import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CompanyCodeDTO {
  @IsUUID('4')
  @IsOptional()
  company_code?: string
}

export class CompanyStoreDTO {
  @ApiProperty({
    required: true,
  })
  @IsString()
  name: string;
  
  @ApiProperty({
    required: true,
  })
  @IsString()
  cnpj: string;
  
  @ApiProperty({
    required: true,
  })
  @IsString()
  domain: string;
  
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  logo?: string;
  
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  primary_color?: string;
}