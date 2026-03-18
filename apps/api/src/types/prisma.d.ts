import { PrismaClient } from '@prisma/client';

declare module '@prisma/client' {
  interface PrismaClient {
    user: any;
    candidate: any;
    resume: any;
    job: any;
    application: any;
    interview: any;
    feedback: any;
  }
}
