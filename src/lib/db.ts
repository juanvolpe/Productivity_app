import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaOptions = process.env.NODE_ENV === 'production' 
  ? { log: ['error'] }
  : { log: ['query', 'error', 'warn'] };

export const prisma = globalThis.prisma || new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma; 