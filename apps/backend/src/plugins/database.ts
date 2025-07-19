import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AppDataSource } from '../config/database';

async function databasePlugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  try {
    // Initialize TypeORM DataSource
    await AppDataSource.initialize();
    fastify.log.info('Database connection established successfully');

    // Make DataSource available throughout the app
    fastify.decorate('db', AppDataSource);

    // Graceful shutdown
    fastify.addHook('onClose', async (instance) => {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        instance.log.info('Database connection closed');
      }
    });
  } catch (error) {
    fastify.log.error('Error connecting to database:', error);
    throw error;
  }
}

export default fp(databasePlugin);
