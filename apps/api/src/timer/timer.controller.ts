import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TimerService } from './timer.service.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class StartTimerDto {
  @ApiProperty({ example: 'uuid-of-project' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ example: 'Working on feature X' })
  @IsOptional()
  @IsString()
  description?: string;
}

@ApiTags('Timer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/timer')
export class TimerController {
  constructor(private readonly timerService: TimerService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a timer for a project' })
  start(@Req() req: any, @Body() dto: StartTimerDto) {
    return this.timerService.start(req.user.id, dto.projectId, dto.description);
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop the active timer' })
  stop(@Req() req: any) {
    return this.timerService.stop(req.user.id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active timer info' })
  getActive(@Req() req: any) {
    return this.timerService.getActive(req.user.id);
  }
}
