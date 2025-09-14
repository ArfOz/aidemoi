import { FastifyInstance } from 'fastify';
// import { CategoriesDBService } from '../services/DatabaseService';
import { QuestionsDBService } from '../services/DatabaseService/QuestionsDBService';
import {
  ApiErrorResponseType,
  ApiErrorSchema,
  QuestionAddSuccessResponse,
  QuestionAddSuccessResponseSchema,
  QuestionUpsertRequest,
  QuestionUpsertRequestSchema,
} from '@api';

async function questionRoutes(fastify: FastifyInstance): Promise<void> {
  const questionsDBService = new QuestionsDBService(fastify.prisma);
  // GET /questions?categoryId=moving
  fastify.get('/questions', async (request, reply) => {
    try {
      return reply.status(200).send({
        success: true,
        message: 'Questions fetched',
        //   data: { questions },
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to fetch questions', code: 500 },
      });
    }
  });

  // POST /question -> create a new question
  fastify.post<{
    Body: QuestionUpsertRequest;
    Reply: QuestionAddSuccessResponse | ApiErrorResponseType;
  }>(
    '/question',
    {
      schema: {
        // validate incoming JSON body against the upsert schema
        body: QuestionUpsertRequestSchema,
        response: {
          200: QuestionAddSuccessResponseSchema,
          400: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const payload = request.body as QuestionUpsertRequest;

        // minimal runtime sanity checks (schema already enforces required fields)
        if (!payload || !payload.i18n || payload.i18n.length === 0) {
          return reply.status(400).send({
            success: false,
            error: {
              message: 'i18n is required and must be a non-empty array',
              code: 400,
            },
          });
        }

        // create via service (cast to any to accommodate Prisma input types)
        const created = await questionsDBService.create(payload as any);

        return reply.status(200).send({
          success: true,
          message: 'Question created',
          data: {
            questionId: created.id,
            submittedAt: created.createdAt.toISOString(),
          },
        });
      } catch (err: any) {
        fastify.log.error(err);
        // map known Prisma errors if desired (e.g., P2002) or return generic error
        const devMsg =
          process.env.NODE_ENV === 'development' && err instanceof Error
            ? err.message
            : 'Failed to create question';
        return reply.status(500).send({
          success: false,
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );
}

export default questionRoutes;
