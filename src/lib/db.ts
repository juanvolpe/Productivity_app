import { PrismaClient } from '@prisma/client'
import { type Global } from 'node'

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaOptions = process.env.NODE_ENV === 'production' 
  ? {
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    }
  : {}

export const prisma = global.prisma || new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') global.prisma = prisma 