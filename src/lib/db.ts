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
  ],
};

export const prisma = globalThis.prisma || new PrismaClient(prismaOptions);

prisma.$on('query', (e: any) => {
  logger.debug('Query:', e.query, e.params);
});

prisma.$on('error', (e: any) => {
  logger.error('Prisma error:', e);
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma; 