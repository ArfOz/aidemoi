import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

async function swaggerPlugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  await fastify.register(require('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Aide Moi Backend API',
        description: 'API documentation for Aide Moi Backend',
        version: '1.0.0'
      },
      host: 'localhost:3300',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'health', description: 'Health check endpoints' },
        { name: 'users', description: 'User related endpoints' },
        { name: 'companies', description: 'Company related endpoints' }
      ]
    }
  });

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request: any, reply: any, next: any) {
        next();
      },
      preHandler: function (request: any, reply: any, next: any) {
        next();
      }
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header
  });
}

export default fp(swaggerPlugin);
