import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import databasePlugin from './plugins/database';
import corsPlugin from './plugins/cors';
import helmetPlugin from './plugins/helmet';
import rateLimitPlugin from './plugins/rateLimit';
import swaggerPlugin from './plugins/swagger';
import healthRoutes from './routes/health';
import apiRoutes from './routes/api';

/**
 * Create and configure Fastify instance
 * @param opts - Fastify options
 * @returns Fastify instance
 */
function build(opts: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      ...(process.env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      }),
    },
    ...opts,
  });

  // Register plugins
  app.register(databasePlugin);
  app.register(corsPlugin);
  app.register(helmetPlugin);
  app.register(rateLimitPlugin);
  app.register(swaggerPlugin);

  // Register routes
  app.register(healthRoutes, { prefix: '/health' });
  app.register(apiRoutes, { prefix: '/api/v1' });
  // app.register(authRoutes, { prefix: '/api/auth' });
  // app.register(userRoutes, { prefix: '/api/user' });
  // app.register(companyRoutes, { prefix: '/api/company' });

  // Global error handler
  app.setErrorHandler(async (error, request, reply) => {
    app.log.error(error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    reply.status(statusCode).send({
      error: {
        message,
        statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
    });
  });

  // 404 handler
  app.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({
      error: {
        message: 'Route not found',
        statusCode: 404,
        path: request.url,
      },
    });
  });

  return app;
}

export default build;
