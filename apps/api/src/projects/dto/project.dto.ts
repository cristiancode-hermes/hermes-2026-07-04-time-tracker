import { IsNotEmpty, IsOptional, IsNumber, Min, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Complete redesign of company website' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'completed', 'paused'] })
  @IsOptional()
  @IsIn(['active', 'completed', 'paused'])
  status?: string;

  @ApiProperty({ example: 'uuid-of-client' })
  @IsNotEmpty()
  clientId: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Website Redesign' })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Complete redesign' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'completed', 'paused'] })
  @IsOptional()
  @IsIn(['active', 'completed', 'paused'])
  status?: string;

  @ApiPropertyOptional({ example: 'uuid-of-client' })
  @IsOptional()
  clientId?: string;
}
