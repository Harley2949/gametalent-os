import { PartialType } from '@nestjs/swagger';
import { CreateProcessNodeDto } from './create-process-node.dto';

export class UpdateProcessNodeDto extends PartialType(CreateProcessNodeDto) {}
