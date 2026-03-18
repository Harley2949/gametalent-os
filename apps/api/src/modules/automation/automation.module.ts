import { Module } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { RuleEngineService } from './rule-engine.service';
import { AutomationController } from './automation.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AutomationController],
  providers: [AutomationService, RuleEngineService, PrismaService],
  exports: [AutomationService, RuleEngineService],
})
export class AutomationModule {}
