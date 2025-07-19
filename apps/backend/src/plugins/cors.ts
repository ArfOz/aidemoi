import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

async function corsPlugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  await fastify.register(require('@fastify/cors'), {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com'] // Add your production domains
        : true, // Allow all origins in development
    credentials: true
  });
}

export default fp(corsPlugin);
