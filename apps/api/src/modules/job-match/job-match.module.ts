import { Module } from '@nestjs/common';
import { JobMatchService } from './job-match.service';
import { JobMatchController } from './job-match.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [JobMatchController],
  providers: [JobMatchService],
  exports: [JobMatchService],
})
export class JobMatchModule {}
