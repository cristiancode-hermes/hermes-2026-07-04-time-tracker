import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service.js';
import {
  CreateInvoiceDto,
  UpdateInvoiceStatusDto,
} from './dto/invoice.dto.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices with filters and pagination' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Req() req: any, @Query() query: any) {
    return this.invoicesService.findAll(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.invoicesService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an invoice with items' })
  create(@Req() req: any, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(req.user.id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    return this.invoicesService.updateStatus(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.invoicesService.remove(id, req.user.id);
  }
}
