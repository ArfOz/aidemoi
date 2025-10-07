import { FastifyPluginAsync } from 'fastify';
import { JobsDBService } from '../services/DatabaseService/JobsDBService.js';

const jobsRoutes: FastifyPluginAsync = async function (fastify) {
  const jobsService = new JobsDBService(fastify.prisma);

  // GET /jobs/:id - Get job with answers and questions
  fastify.get<{
    Params: { id: string };
  }>(
    '/jobs/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              answers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    content: { type: 'string' },
                    question: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const job = await jobsService.findUniqueWithAnswersAndQuestions({
          id: parseInt(request.params.id, 10),
        });

        if (!job) {
          return reply.status(404).send({
            error: 'Not Found',
            message: `Job with id ${request.params.id} not found`,
          });
        }

        return reply.send(job);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve job',
        });
      }
    }
  );

  // GET /jobs - Get all jobs with answers and questions (with pagination)
  fastify.get<{
    Querystring: {
      page?: number;
      limit?: number;
    };
  }>(
    '/jobs',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    answers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          content: { type: 'string' },
                          question: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              title: { type: 'string' },
                              content: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const skip = (page - 1) * limit;

        const jobs = await jobsService.findManyWithAnswersAndQuestions({
          take: limit,
          skip,
          orderBy: { createdAt: 'desc' },
        });

        const total = await fastify.prisma.job.count();

        return reply.send({
          data: jobs,
          pagination: {
            page,
            limit,
            total,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve jobs',
        });
      }
    }
  );
};

export default jobsRoutes;
