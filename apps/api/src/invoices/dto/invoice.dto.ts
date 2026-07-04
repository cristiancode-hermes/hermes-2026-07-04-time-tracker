import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'Website development' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  hours: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ example: 'uuid-of-project' })
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-time-entry' })
  @IsOptional()
  timeEntryId?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'INV-2026-001' })
  @IsNotEmpty()
  invoiceNumber: string;

  @ApiPropertyOptional({ example: 'Payment due within 30 days' })
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 0.1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiProperty({ example: '2026-07-04' })
  @IsString()
  issueDate: string;

  @ApiProperty({ example: '2026-08-03' })
  @IsString()
  dueDate: string;

  @ApiProperty({ example: 'uuid-of-client' })
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ example: 'sent', enum: ['draft', 'sent', 'paid', 'overdue'] })
  @IsNotEmpty()
  @IsIn(['draft', 'sent', 'paid', 'overdue'])
  status: string;
}
