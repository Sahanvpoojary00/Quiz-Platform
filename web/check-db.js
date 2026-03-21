const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    users.forEach(u => console.log(`- ${u.email} (${u.role}) ID: ${u.id}`));
  } catch (err) {
    console.error('DB Check error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
