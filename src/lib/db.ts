import { PrismaClient, Prisma } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaOptions: any = {
  log: process.env.NODE_ENV === 'production'
    ? ['error']
    : [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' }
      ],
  errorFormat: 'pretty',
};

if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
  throw new Error('Database URL not found in environment variables');
}

export const prisma = globalThis.prisma || new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma; 