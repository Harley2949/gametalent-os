import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Get('candidate/:candidateId')
  @ApiOperation({ summary: '获取候选人反馈' })
  findByCandidate(@Param('candidateId') candidateId: string) {
    return this.feedbackService.findByCandidate(candidateId);
  }

  @Post()
  @ApiOperation({ summary: '创建反馈' })
  create(@Body() data: any, @Request() req) {
    return this.feedbackService.create(data, req.user.userId);
  }
}
