const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
      where: { email: 'admin@gametalent.os' },
      update: { password: hashedPassword },
      create: {
        email: 'admin@gametalent.os',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('✅ Admin user created/updated successfully:', user.email);
    console.log('   User ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
