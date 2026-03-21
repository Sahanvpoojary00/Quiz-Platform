const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.auditLog.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.user.deleteMany({});

  await prisma.systemState.deleteMany({});

  console.log('Seeding System State...');
  await prisma.systemState.create({
    data: { id: 1, status: 'LOBBY', currentRound: 1 }
  });

  console.log('Seeding Admin User...');
  await prisma.user.create({
    data: {
      name: 'Global Admin',
      email: 'admin@quiz.com',
      password: 'admin', // In production, use hashed passwords
      role: 'ADMIN'
    }
  });

  console.log('Seeding questions...');

  // Round 1: MCQ
  await prisma.question.createMany({
    data: [
      {
        type: 'MCQ',
        content: 'Which of the following is NOT a JavaScript data type?',
        options: JSON.stringify(['String', 'Number', 'Float', 'Boolean']),
        answer: 'Float',
        round: 1
      },
      {
        type: 'MCQ',
        content: 'What does CSS stand for?',
        options: JSON.stringify(['Cascading Style Sheets', 'Creative Style System', 'Computer Style Sheets', 'Colorful Style Sheets']),
        answer: 'Cascading Style Sheets',
        round: 1
      }
    ]
  });

  // Round 2: Visual + Coding
  await prisma.question.createMany({
    data: [
      {
        type: 'VISUAL',
        content: 'Identify the pattern in this component structure (Mental Visual Task). What is the output of a 3-layer recursion with base case 1?',
        options: JSON.stringify(['3', '4', '7', '8']),
        answer: '7',
        round: 2
      },
      {
        type: 'CODING',
        content: 'Write a Python function `add(a, b)` that returns the sum of two numbers.',
        answer: 'def add(a, b):\n    return a + b\n\nprint(add(2, 3))',
        test_cases: '5',
        round: 2
      }
    ]
  });

  // Round 3: Rapid Fire MCQ
  await prisma.question.createMany({
    data: [
      {
        type: 'MCQ',
        content: 'Is SQL a programming language?',
        options: JSON.stringify(['Yes', 'No']),
        answer: 'Yes',
        round: 3
      }
    ]
  });


  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
