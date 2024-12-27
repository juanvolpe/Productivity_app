import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

logger.info('Initializing Prisma client with environment:', {
  nodeEnv: process.env.NODE_ENV,
  hasDbUrl: !!process.env.DATABASE_URL
});

const prismaOptions = {
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ] as const,
};

export const prisma = globalThis.prisma || new PrismaClient(prismaOptions);

type PrismaEvent = {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
};

prisma.$on('query', (e: PrismaEvent) => {
  logger.debug('Query:', e.query, e.params);
});

prisma.$on('error', (e: Error) => {
  logger.error('Prisma error:', e);
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma; 