import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

async function rateLimitPlugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  await fastify.register(require('@fastify/rate-limit'), {
    max: 100, // Maximum 100 requests
    timeWindow: '1 minute', // Per minute
    errorResponseBuilder: function (request: any, context: any) {
      return {
        error: {
          message: 'Rate limit exceeded, retry in 1 minute',
          statusCode: 429,
          retryAfter: Math.round(context.ttl / 1000)
        }
      };
    }
  });
}

export default fp(rateLimitPlugin);
