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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service.js';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'List clients with search and pagination' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Req() req: any, @Query() query: any) {
    return this.clientsService.findAll(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.clientsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a client' })
  create(@Req() req: any, @Body() dto: CreateClientDto) {
    return this.clientsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.clientsService.remove(id, req.user.id);
  }
}
