import { FastifyInstance } from 'fastify';
// Fix: Import from the index file, not individual files
import {
  QuestionsDBService,
  SubCategoriesDBService,
} from '../services/DatabaseService';
import {
  ApiResponseErrorSchema,
  QuestionGetRequest,
  QuestionGetRequestSchema,
  QuestionGetSuccessResponseSchema,
  QuestionUpsertRequest,
  QuestionUpdateRequestSchema,
  QuestionUpdateSuccessResponseSchema,
  QuestionUpsertRequestSchema,
  QuestionAddSuccessResponseSchema,
  ApiResponseType,
} from '@api';
import { Prisma } from '@prisma/client';

export async function questionsRoutes(fastify: FastifyInstance): Promise<void> {
  const questionsDBService = new QuestionsDBService(fastify.prisma);
  // Fix: Use correct service name
  const subcategoriesDBService = new SubCategoriesDBService(fastify.prisma);

  // Ensure all thrown errors are serialized into the project's ApiErrorSchema shape
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error);

    const statusCode =
      (error && (error as unknown as { statusCode?: number }).statusCode) ||
      500;
    const message =
      process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.message
        : statusCode >= 500
        ? 'Internal Server Error'
        : String(
            (error as unknown as { message?: unknown }).message || 'Error'
          );

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
    Reply: ApiResponseType<typeof QuestionAddSuccessResponseSchema>;
  }>(
    '/question',
    {
      schema: {
        // validate incoming JSON body against the upsert schema
        body: QuestionUpsertRequestSchema,
        response: {
          200: QuestionAddSuccessResponseSchema,
          400: ApiResponseErrorSchema,
          500: ApiResponseErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const payload = request.body;

        // Fix: Use correct service variable name
        const hasSubcategoryId = await subcategoriesDBService.findUnique({
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
            create: data.translations.map(
              (t: {
                locale: string;
                label: string;
                description?: string | null;
              }) => ({
                locale: t.locale,
                label: t.label,
                description: t.description ?? null,
              })
            ),
          },

          // Options + their translations (omit sortOrder if not supported by schema)
          options: data.options
            ? {
                create: data.options.map(
                  (o: {
                    value: string;
                    translations?: Array<{ locale: string; label: string }>;
                  }) => ({
                    value: o.value,
                    translations: {
                      create: (o.translations || []).map((ot) => ({
                        locale: ot.locale,
                        label: ot.label,
                      })),
                    },
                  })
                ),
              }
            : undefined,
        };

        const created = await questionsDBService.create(createInput);

        return reply.status(200).send({
          success: true,
          message: 'Question created',
          data: {
            questionId: created.id,
            submittedAt: new Date().toISOString(),
          },
        });
      } catch (err) {
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

  // GET /question/:id
  fastify.get<{
    Params: { id: string };
    Querystring: QuestionGetRequest;
    Reply: ApiResponseType<typeof QuestionGetSuccessResponseSchema>;
  }>(
    '/question/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        querystring: QuestionGetRequestSchema,
        response: {
          200: QuestionGetSuccessResponseSchema,
          500: ApiResponseErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { lang } = request.query;

        const questions = await questionsDBService.findById({
          where: { id: parseInt(id, 10) },
          language: lang,
        });

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
          error: { message: 'Failed to fetch questions', code: 500 },
        });
      }
    }
  );

  // PATCH /question/:id -> update existing question
  fastify.patch<{
    Params: { id: string };
    Body: Partial<QuestionUpsertRequest> & {
      translations?: Array<{
        locale: string;
        label: string;
        description?: string | null;
      }>;
      options?: Array<{
        value: string;
        translations?: Array<{ locale: string; label: string }>;
      }>;
    };
  }>(
    '/question/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        body: QuestionUpdateRequestSchema,
        response: {
          200: QuestionUpdateSuccessResponseSchema,
          400: ApiResponseErrorSchema,
          404: ApiResponseErrorSchema,
          500: ApiResponseErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);
        const payload = request.body as Partial<QuestionUpsertRequest> & {
          translations?: Array<{
            locale: string;
            label: string;
            description?: string | null;
          }>;
          options?: Array<{
            value: string;
            translations?: Array<{ locale: string; label: string }>;
          }>;
        };

        // ensure question exists
        const existing = await fastify.prisma.question.findUnique({
          where: { id },
        });
        if (!existing) {
          return reply.status(404).send({
            success: false,
            message: 'Question not found',
            error: { message: 'Question not found', code: 404 },
          });
        }

        // validate subcategory if provided
        if (payload.subcategoryId) {
          // Fix: Use correct service and method
          const sub = await subcategoriesDBService.findUnique({
            where: { id: payload.subcategoryId },
          });
          if (!sub) {
            return reply.status(400).send({
              success: false,
              message: 'Invalid subcategoryId',
              error: { message: 'Subcategory not found', code: 400 },
            });
          }
        }

        // Build update payload for question base fields
        const updateData: Prisma.QuestionUpdateInput = {
          type: payload.type ?? undefined,
          required:
            typeof payload.required === 'boolean'
              ? payload.required
              : undefined,
          isActive:
            typeof payload.isActive === 'boolean'
              ? payload.isActive
              : undefined,
          sortOrder:
            typeof payload.sortOrder === 'number'
              ? payload.sortOrder
              : undefined,
          subcategory: payload.subcategoryId
            ? { connect: { id: payload.subcategoryId } }
            : undefined,
        };

        // Handle translations update
        if (Array.isArray(payload.translations)) {
          await fastify.prisma.questionTranslation.deleteMany({
            where: { questionId: id },
          });
          updateData.translations = {
            create: payload.translations.map((t) => ({
              locale: t.locale,
              label: t.label,
              description: t.description ?? null,
            })),
          } as Prisma.QuestionUpdateInput['translations'];
        }

        // Handle options update
        if (Array.isArray(payload.options)) {
          const existingOptions = await fastify.prisma.option.findMany({
            where: { questionId: id },
          });
          const optionIds = existingOptions.map((o) => o.id);
          if (optionIds.length > 0) {
            await fastify.prisma.optionTranslation.deleteMany({
              where: { optionId: { in: optionIds } },
            });
            await fastify.prisma.option.deleteMany({
              where: { id: { in: optionIds } },
            });
          }

          updateData.options = {
            create: payload.options.map((o) => ({
              value: o.value,
              translations: {
                create: (o.translations || []).map((ot) => ({
                  locale: ot.locale,
                  label: ot.label,
                })),
              },
            })),
          } as Prisma.QuestionUpdateInput['options'];
        }

        const updated = await questionsDBService.update({ id }, updateData);

        return reply.status(200).send({
          success: true,
          message: 'Question updated',
          data: { questionId: updated.id, updatedAt: new Date().toISOString() },
        });
      } catch (err) {
        fastify.log.error(err);
        const devMsg =
          process.env.NODE_ENV === 'development' && err instanceof Error
            ? err.message
            : 'Failed to update question';
        return reply.status(500).send({
          success: false,
          message: 'Request failed',
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );

  // GET /subcategory/:subcategoryId -> Get all questions for a subcategory
  fastify.get<{
    Params: { subcategoryId: string };
    Querystring: { lang: string };
    Reply: ApiResponseType<typeof QuestionGetSuccessResponseSchema>;
  }>(
    '/subcategory/:subcategoryId',
    {
      schema: {
        params: {
          type: 'object',
          properties: { subcategoryId: { type: 'string' } },
          required: ['subcategoryId'],
        },
        querystring: {
          type: 'object',
          properties: { lang: { type: 'string' } },
          required: ['lang'],
          additionalProperties: false,
        },
        response: {
          200: QuestionGetSuccessResponseSchema,
          500: ApiResponseErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { subcategoryId } = request.params;
        const { lang } = request.query;

        const questions = await questionsDBService.findAll({
          where: {
            subcategoryId: parseInt(subcategoryId, 10),
          },
          language: lang,
          select: {
            id: true,
            subcategoryId: true,
            isActive: true,
            sortOrder: true,
            type: true,
            required: true,
            validation: true,
            translations: {
              where: { locale: lang || 'en' },
            },
            options: {
              include: {
                translations: { where: { locale: lang || 'en' } },
              },
              orderBy: { id: 'asc' },
            },
          },
        });

        return reply.status(200).send({
          success: true,
          message: 'Questions fetched',
          data: { questions },
        });
      } catch (err) {
        fastify.log.error(err);
        const devMsg =
          process.env.NODE_ENV === 'development' && err instanceof Error
            ? err.message
            : 'Failed to fetch questions';
        return reply.status(500).send({
          success: false,
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );
}
