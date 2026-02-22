import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma__: PrismaClient | undefined;
}

export function getPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!global.__prisma__) {
    global.__prisma__ = new PrismaClient();
  }

  return global.__prisma__;
}
