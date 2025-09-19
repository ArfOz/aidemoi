import { Question } from '@prisma/client';
import { FastifyInstance } from 'fastify';
// import { CategoriesDBService } from '../services/DatabaseService';
import { QuestionsDBService } from '../services/DatabaseService/QuestionsDBService';
import {
  ApiErrorResponseType,
  ApiErrorSchema,
  CategoryGetRequestSchema,
  QuestionAddSuccessResponse,
  QuestionAddSuccessResponseSchema,
  QuestionGetRequestSchema,
  QuestionGetSuccessResponse,
  QuestionGetSuccessResponseSchema,
  QuestionUpsertRequest,
  QuestionUpsertRequestSchema,
} from '@api';
import { SubCategoriesDBServices } from '../services/DatabaseService/SubCategoriesDBServices';
import { Prisma } from '@prisma/client';

async function questionRoutes(fastify: FastifyInstance): Promise<void> {
  const questionsDBService = new QuestionsDBService(fastify.prisma);
  const subCategoriesDBService = new SubCategoriesDBServices(fastify.prisma);

  // Ensure all thrown errors are serialized into the project's ApiErrorSchema shape
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error);

    const statusCode = (error && (error as any).statusCode) || 500;
    const message =
      process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.message
        : statusCode >= 500
        ? 'Internal Server Error'
        : String((error as any).message || 'Error');

    // Always include the required "success" field and format "error" per ApiErrorSchema
    return reply.status(statusCode).send({
      success: false,
      error: { message, code: statusCode },
      message,
    });
  });

  // fastify.get<{
  //   Params: { id: string };
  //   Querystring: { lang: string };
  //   Reply: ApiErrorResponseType | QuestionGetSuccessResponse;
  // }>(
  //   '/question/:id/',
  //   {
  //     schema: {
  //       params: {
  //         type: 'object',
  //         properties: { id: { type: 'string' } },
  //         required: ['id'],
  //       },
  //       // require "lang" query param
  //       querystring: {
  //         type: 'object',
  //         properties: {
  //           lang: { type: 'string' },
  //         },
  //         required: ['lang'],
  //         additionalProperties: false,
  //       },
  //       response: {
  //         200: QuestionGetSuccessResponseSchema,
  //         404: ApiErrorSchema,
  //         500: ApiErrorSchema,
  //       },
  //     },
  //   },

  //   async (request, reply) => {
  //     try {
  //       const question: Question | null = await questionsDBService.findById({
  //         where: { id: parseInt(request.params.id, 10) },
  //         language: request.query.lang, // required string
  //       });

  //       if (!question) {
  //         return reply.status(404).send({
  //           success: false,
  //           error: { message: 'Question not found', code: 404 },
  //         });
  //       }

  //       return reply.status(200).send({
  //         success: true,
  //         message: 'Question fetched',
  //         data: {
  //           question: {
  //             ...question,
  //             createdAt: question.createdAt.toISOString(),
  //             updatedAt: question.updatedAt.toISOString(),
  //           },
  //         },
  //       });
  //     } catch (err) {
  //       fastify.log.error(err);
  //       return reply.status(500).send({
  //         success: false,
  //         error: { message: 'Failed to fetch questions', code: 500 },
  //       });
  //     }
  //   }
  // );

  // POST /question -> create a new question
  fastify.post<{
    Body: QuestionUpsertRequest;
    Reply: QuestionAddSuccessResponse | ApiErrorResponseType | any;
  }>(
    '/question',
    // {
    //   schema: {
    //     // validate incoming JSON body against the upsert schema
    //     body: QuestionUpsertRequestSchema,
    //     response: {
    //       200: QuestionAddSuccessResponseSchema,
    //       400: ApiErrorSchema,
    //       500: ApiErrorSchema,
    //     },
    //   },
    // },
    async (request, reply) => {
      try {
        const payload = request.body;

        const hasSubcategoryId = await subCategoriesDBService.findUnique({
          where: { id: payload.subcategoryId },
        });

        if (!hasSubcategoryId) {
          return reply.status(400).send({
            success: false,
            error: {
              message: 'Invalid subcategoryId: not found',
              code: 400,
            },
          });
        }

        const data = payload;

        const createInput: Prisma.QuestionCreateInput = {
          type: data.type,
          required: data.required ?? false,
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0,

          subcategory: {
            connect: { id: data.subcategoryId },
          },

          // Question translations
          translations: {
            create: data.translations.map((t: any) => ({
              locale: t.locale,
              label: t.label,
              description: t.description ?? null,
            })),
          },

          // Options + their translations (omit sortOrder if not supported by schema)
          options: data.options
            ? {
                create: data.options.map((o: any) => ({
                  value: o.value,
                  translations: {
                    create: o.translations.map((ot: any) => ({
                      locale: ot.locale,
                      label: ot.label,
                    })),
                  },
                })),
              }
            : undefined,
        };

        const created = await questionsDBService.create(createInput);

        return reply.status(200).send({
          success: true,
          message: 'Question created',
          data: {
            questionId: created.id,
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

  // GET /question/categories
  fastify.get<{
    Params: { id: string };
    // Querystring: CategoryGetRequest;
    // Reply: CategoryDetailSuccessResponse | ApiErrorResponseType;
  }>(
    '/question/:id',
    {
      schema: {
        // require "lang" query param
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        querystring: CategoryGetRequestSchema,
        // response: {
        //   200: CategoryGetSuccessResponseSchema,
        //   500: ApiErrorSchema,
        // },
      },
    },

    async (request, reply) => {
      try {
        const { id } = request.params;
        const questions = await questionsDBService.findById({
          where: { id: parseInt(id, 10) },
          language: request.query.lang,
        });

        console.log(questions);

        return reply.status(200).send({
          success: true,
          message: 'Questions fetched',
          data: {
            questions,
          },
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          success: false,
          error: { message: 'Failed to fetch categories', code: 500 },
        });
      }
    }
  );
}

export default questionRoutes;
