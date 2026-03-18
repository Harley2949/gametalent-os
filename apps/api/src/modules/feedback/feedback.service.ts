import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    return this.prisma.feedback.create({
      data: { ...data, authorId: userId },
    });
  }

  async findByCandidate(candidateId: string) {
    return this.prisma.feedback.findMany({
      where: { candidateId },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
