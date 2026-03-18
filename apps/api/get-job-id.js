const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getJobId() {
  const job = await prisma.job.findFirst();
  if (job) {
    console.log(job.id);
  } else {
    console.log('ERROR: No jobs found');
  }
  await prisma.$disconnect();
}

getJobId();
