import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import prismaPlugin from './plugins/prisma';
import corsPlugin from './plugins/cors';
import helmetPlugin from './plugins/helmet';
import rateLimitPlugin from './plugins/rateLimit';
import swaggerPlugin from './plugins/swagger';
import healthRoutes from './routes/health';
import apiRoutes from './routes/api';
import { authRoutes } from './routes/customer/auth.user';

function build(opts: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      ...(process.env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }),
    },
    ...opts,
  });

  /**
   * 🪄 Global Serializer:
   * Tüm Date nesnelerini otomatik ISO string'e çevirir.
   * Fastify + TypeBox JSON Schema ile tam uyumludur.
   */
  app.setSerializerCompiler(() => {
    return (data) =>
      JSON.stringify(data, (_, value) => (value instanceof Date ? value.toISOString() : value));
  });

  // ✅ onSend hook artık gereksiz, kaldırıldı

  // Register plugins
  app.register(prismaPlugin);
  app.register(corsPlugin);
  app.register(helmetPlugin);
  app.register(rateLimitPlugin);
  app.register(swaggerPlugin);

  // Register routes
  app.register(healthRoutes, { prefix: '/health' });
  app.register(apiRoutes, { prefix: '/api/v1' });
  app.register(authRoutes, { prefix: '/api/auth' });

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
