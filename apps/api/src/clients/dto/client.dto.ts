import { IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'TechCorp' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'contact@techcorp.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'TechCorp Inc.' })
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ example: 'Prefers email contact' })
  @IsOptional()
  notes?: string;
}

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'TechCorp' })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'contact@techcorp.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'TechCorp Inc.' })
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ example: 'Prefers email contact' })
  @IsOptional()
  notes?: string;
}
