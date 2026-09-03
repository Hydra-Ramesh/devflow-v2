import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('Connected to Postgres Notification Service');
  } catch (error) {
    console.error('Failed to connect to Postgres', error);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await prisma.$disconnect();
  console.log(' Disconnected from Postgres');
}
