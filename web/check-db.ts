import prisma from './src/lib/db';

async function check() {
  try {
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    users.forEach(u => console.log(`- ${u.email} (${u.role})`));
  } catch (err) {
    console.error('DB Check error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
