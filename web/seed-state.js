const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedState() {
  try {
    const existing = await prisma.systemState.findUnique({ where: { id: 1 } });
    if (!existing) {
      await prisma.systemState.create({
        data: { id: 1, status: 'LOBBY', currentRound: 1 }
      });
      console.log('System state initialized to LOBBY.');
    } else {
      console.log('System state already exists.');
    }
  } catch (err) {
    console.error('Seed state error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedState();
