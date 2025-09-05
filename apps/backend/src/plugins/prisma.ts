import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Use TypeScript module augmentation to declare the type of server.prisma to be PrismaClient
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

// Replace direct instantiation with a global-backed singleton to avoid multiple clients during hot reload
const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };
const prisma = globalForPrisma.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

const prismaPlugin: FastifyPluginAsync = async (server) => {
  // safe connect
  try {
    await prisma.$connect();
  } catch (err) {
    // ensure any partial connections are closed and bubble up
    await prisma.$disconnect().catch(() => {});
    throw err;
  }

  // Make Prisma Client available through the fastify server instance
  server.decorate('prisma', prisma);

  server.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin, { name: 'prisma' });
