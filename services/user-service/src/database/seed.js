import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create a test user
  const hashedPassword = await hashPassword('password123');
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: hashedPassword,
    },
  });

  console.log('Created user:', user);

  // Create a test player quiz entry
  const playerQuiz = await prisma.playerQuiz.upsert({
    where: {
      playerId_quizId: {
        playerId: user.id,
        quizId: 'test-quiz-123',
      },
    },
    update: {},
    create: {
      playerId: user.id,
      quizId: 'test-quiz-123',
    },
  });

  console.log('Created player quiz entry:', playerQuiz);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 