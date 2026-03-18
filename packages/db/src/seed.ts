import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedAuth } from './seed-auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // 初始化认证与权限数据
  await seedAuth();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gametalent.os' },
    update: {},
    create: {
      email: 'admin@gametalent.os',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      department: 'Engineering',
      title: 'System Administrator',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create sample recruiter
  const recruiterPassword = await bcrypt.hash('recruiter123', 10);
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@gametalent.os' },
    update: {},
    create: {
      email: 'recruiter@gametalent.os',
      name: 'Jane Recruiter',
      password: recruiterPassword,
      role: 'RECRUITER',
      status: 'ACTIVE',
      department: 'Human Resources',
      title: 'Senior Technical Recruiter',
    },
  });

  console.log('Created recruiter user:', recruiter.email);

  // Create sample job
  const job = await prisma.job.create({
    data: {
      title: 'Senior Game Developer - Unity',
      description: `We are looking for a Senior Game Developer to join our team.

Key Responsibilities:
- Design and implement game features using Unity
- Collaborate with cross-functional teams
- Mentor junior developers
- Optimize game performance`,

      requirements: `Requirements:
- 5+ years of game development experience
- Strong Unity and C# skills
- Experience with multiplayer games
- Understanding of game design patterns`,

      responsibilities: `You will:
- Lead development of core game systems
- Write clean, maintainable code
- Participate in code reviews
- Contribute to technical design`,

      status: 'PUBLISHED',
      type: 'FULL_TIME',
      workMode: 'HYBRID',
      experienceLevel: 'SENIOR',
      priority: 'HIGH',

      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: 'USD',

      location: 'San Francisco, CA',
      remoteRegions: ['US-West', 'US-Pacific'],

      department: 'Engineering',
      team: 'Game Development',

      targetCompanies: ['Blizzard', 'Riot Games', 'Valve', 'Electronic Arts'],
      targetSkills: ['Unity', 'C#', 'Game Development', 'Multiplayer', 'Physics'],

      publishedAt: new Date(),
      createdBy: admin.id,
    },
  });

  console.log('Created sample job:', job.title);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
