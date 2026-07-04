import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeEntryDto {
  @ApiPropertyOptional({ example: 'Worked on homepage layout' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0)
  duration: number;

  @ApiProperty({ example: '2026-07-04' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be YYYY-MM-DD' })
  date: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  billable?: boolean;

  @ApiProperty({ example: 'uuid-of-project' })
  @IsNotEmpty()
  projectId: string;
}

export class UpdateTimeEntryDto {
  @ApiPropertyOptional({ example: 'Worked on homepage layout' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ example: '2026-07-04' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be YYYY-MM-DD' })
  date?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  billable?: boolean;

  @ApiPropertyOptional({ example: 'uuid-of-project' })
  @IsOptional()
  projectId?: string;
}

export class QueryTimeEntryDto {
  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-07-04' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ example: 'uuid-of-project' })
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-client' })
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({ example: 'search term' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  limit?: number;
}
