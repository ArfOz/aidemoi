import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply
} from 'fastify';
import userRoutes from './users';
import companyRoutes from './company';
import authRoutes from './auth';

async function apiRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Register sub-routes
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(companyRoutes, { prefix: '/companies' });
  fastify.register(authRoutes, { prefix: '/auth' });

  // Root API endpoint
  fastify.get(
    '/',
    {
      schema: {
        tags: ['api'],
        summary: 'API root',
        description: 'Get API information',
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              version: { type: 'string' },
              timestamp: { type: 'string' }
            }
          }
        }
      }
    },
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      return {
        message: 'Welcome to Aide Moi Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      };
    }
  );
}

export default apiRoutes;
