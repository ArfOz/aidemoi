import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply
} from 'fastify';

async function healthRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Health check endpoint
  fastify.get(
    '/',
    {
      schema: {
        tags: ['health'],
        summary: 'Health check',
        description: 'Check if the service is running',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              environment: { type: 'string' }
            }
          }
        }
      }
    },
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      };
    }
  );

  // Detailed health check
  fastify.get(
    '/detailed',
    {
      schema: {
        tags: ['health'],
        summary: 'Detailed health check',
        description: 'Get detailed health information',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              environment: { type: 'string' },
              version: { type: 'string' },
              memory: { type: 'object' },
              cpu: { type: 'object' }
            }
          }
        }
      }
    },
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      };
    }
  );
}

export default healthRoutes;
