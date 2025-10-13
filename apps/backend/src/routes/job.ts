import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authenticateToken } from '../middleware/auth';
import { Type } from '@sinclair/typebox';
import {
  AnswerAddSuccessResponse,
  AnswerAddSuccessResponseSchema,
  AnswerGetRequest,
  AnswerGetRequestSchema,
  AnswerGetSuccessResponse,
  AnswerGetSuccessResponseSchema,
  AnswersCreateRequest,
  AnswersCreateRequestSchema,
  ApiErrorResponseType,
  ApiErrorSchema,
  AuthHeadersSchema,
  IdParamsSchema,
  IdParamUrl,
  // Add job-related imports
  JobCreateRequest,
  JobCreateRequestSchema,
  JobCreateSuccessResponse,
  JobCreateSuccessResponseSchema,
  JobDetailSuccessResponseSchema,
  JobGetIdRequestSchema,
  MyJobsGetRequest,
  MyJobsGetRequestSchema,
  MyJobsGetSuccessResponseSchema,
} from '@api';
import {
  AnswersDBService,
  QuestionsDBService,
  JobsDBService,
  SubCategoriesDBService, // Fixed: Changed from SubCategoriesDBService
} from '../services/DatabaseService';

export async function jobRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  const answerDBService = new AnswersDBService(fastify.prisma);
  const questionsService = new QuestionsDBService(fastify.prisma);
  const jobDBService = new JobsDBService(fastify.prisma);
  const subcategoriesDBService = new SubCategoriesDBService(fastify.prisma); // Fixed: Consistent naming

  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error);

    const statusCode = (error && (error as any).statusCode) || 500;

    const message =
      process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.message
        : statusCode >= 500
        ? 'Internal Server Error'
        : String((error as any).message || 'Error');

    return reply.status(statusCode).send({
      success: false,
      error: { message, code: statusCode },
    });
  });

  // GET /job/:id - Get job with detailed answers and questions
  fastify.get<{
    Params: IdParamUrl; // TypeScript type for the parameter
    Querystring: { locale?: string };
  }>(
    '/job/:id', // Route with :id parameter
    {
      schema: {
        params: IdParamsSchema,
        headers: AuthHeadersSchema,
        querystring: JobGetIdRequestSchema,
        response: {
          200: MyJobsGetSuccessResponseSchema,
          404: ApiErrorSchema,
        },
      },
    },

    async function (request, reply) {
      // request.params.id will be validated as a string
      const jobId = parseInt(request.params.id);
      try {
        if (isNaN(jobId)) {
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'Invalid job ID',
          });
        }

        const job = await jobDBService.findUniqueWithAnswersAndQuestions(
          { id: jobId },
          request.query.locale
        );

        if (!job) {
          return reply.status(404).send({
            error: 'Not Found',
            message: `Job with id ${jobId} not found`,
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

  // ✅ GET /my-jobs → Get current user's jobs
  fastify.get<{
    Headers: { authorization: string };
    Querystring: MyJobsGetRequest;
  }>(
    '/my-jobs',
    {
      preHandler: authenticateToken,
      schema: {
        headers: AuthHeadersSchema,
        querystring: MyJobsGetRequestSchema,
        response: {
          200: MyJobsGetSuccessResponseSchema,
          400: ApiErrorSchema,
          401: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const userId =
          (request as any).user?.userId ??
          (request as any).user?.id ??
          (request as any).userId;

        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Unauthorized', code: 401 },
          });
        }

        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const skip = (page - 1) * limit;

        // Build where clause for user's jobs
        const where: any = {
          userId: Number(userId),
        };

        if (request.query.status) {
          where.status = request.query.status;
        }

        if (request.query.subcategoryId) {
          where.subcategoryId = request.query.subcategoryId;
        }

        // Build translation filters based on locale
        const translationWhere = request.query.locale
          ? { locale: request.query.locale }
          : undefined;

        const jobs = await fastify.prisma.job.findMany({
          where,
          include: {
            subcategory: {
              include: {
                i18n: translationWhere ? { where: translationWhere } : true,
              },
            },
            _count: {
              select: {
                bids: true,
                answers: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
        });

        const total = await fastify.prisma.job.count({ where });
        const totalPages = Math.ceil(total / limit);

        return reply.status(200).send({
          success: true,
          message: 'User jobs retrieved successfully',
          data: {
            jobs,
            pagination: {
              page,
              limit,
              total,
              totalPages,
            },
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Failed to retrieve user jobs', code: 500 },
        });
      }
    }
  );

  // ✅ POST /jobs → Create a new job with answers
  fastify.post<{
    Headers: { authorization: string };
    Body: JobCreateRequest;
    Reply: JobCreateSuccessResponse | ApiErrorResponseType;
  }>(
    '/jobs',
    {
      preHandler: authenticateToken,
      schema: {
        headers: AuthHeadersSchema,
        body: JobCreateRequestSchema,
        response: {
          201: JobCreateSuccessResponseSchema,
          400: ApiErrorSchema,
          401: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const userId =
          (request as any).user?.userId ??
          (request as any).user?.id ??
          (request as any).userId;

        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Unauthorized', code: 401 },
          });
        }

        const { title, description, subcategoryId, answers } = request.body; // Fixed: Added location, changed answerIds to answers

        // Validate required fields
        if (!title || !title.trim()) {
          return reply.status(400).send({
            success: false,
            error: { message: 'Title is required', code: 400 },
          });
        }

        if (!subcategoryId) {
          return reply.status(400).send({
            success: false,
            error: { message: 'Subcategory ID is required', code: 400 },
          });
        }

        // Validate subcategory exists
        const subcategory = await subcategoriesDBService.findUnique({
          where: { id: subcategoryId },
        });
        if (!subcategory) {
          return reply.status(400).send({
            success: false,
            error: {
              message: `Subcategory with ID ${subcategoryId} not found`,
              code: 400,
            },
          });
        }

        // Validate answers if provided
        const createdAnswers = [];
        if (answers && answers.length > 0) {
          // Create answers first
          for (const answerData of answers) {
            const {
              questionId,
              optionId = null,
              textValue = null,
              numberValue = null,
              dateValue,
              inputLanguage = null,
            } = answerData;

            try {
              // Validate question exists and belongs to the subcategory
              const question = await fastify.prisma.question.findUnique({
                where: { id: questionId },
                select: { id: true, isActive: true, subcategoryId: true },
              });

              if (!question || !question.isActive) {
                throw new Error(
                  `Question with ID ${questionId} not found or inactive`
                );
              }

              if (question.subcategoryId !== subcategoryId) {
                throw new Error(
                  `Question ${questionId} does not belong to subcategory ${subcategoryId}`
                );
              }

              // Validate option if provided
              if (optionId) {
                const option = await fastify.prisma.option.findFirst({
                  where: {
                    id: optionId,
                    questionId: questionId,
                  },
                });

                if (!option) {
                  throw new Error(
                    `Option with ID ${optionId} not found or does not belong to question ${questionId}`
                  );
                }
              }

              // Create the answer
              const answerCreateData: any = {
                user: { connect: { id: Number(userId) } },
                question: { connect: { id: questionId } },
                textValue,
                numberValue,
                dateValue: dateValue ? new Date(dateValue) : undefined,
                inputLanguage,
              };

              if (optionId) {
                answerCreateData.option = { connect: { id: optionId } };
              }

              const answer = await answerDBService.create(answerCreateData);
              createdAnswers.push(answer.id);
            } catch (answerError) {
              fastify.log.error(answerError);
              return reply.status(400).send({
                success: false,
                error: {
                  message: `Failed to create answer for question ${questionId}: ${
                    (answerError as Error).message
                  }`,
                  code: 400,
                },
              });
            }
          }
        }

        // Create the job
        const jobData = {
          title: title.trim(),
          description: description?.trim() || null,
          user: { connect: { id: Number(userId) } },
          subcategory: { connect: { id: subcategoryId } },
        };

        const createdJob = await jobDBService.create(jobData);

        // Link answers to the job if any were created
        if (createdAnswers.length > 0) {
          await fastify.prisma.answer.updateMany({
            where: {
              id: { in: createdAnswers },
              userId: userId,
            },
            data: {
              jobId: createdJob.id,
            },
          });
        }

        return reply.status(201).send({
          success: true,
          message: 'Job created successfully',
          data: {
            jobId: createdJob.id,
            createdAt: createdJob.createdAt.toISOString(),
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Failed to create job', code: 500 },
        });
      }
    }
  );

  // ✅ POST /answers → create multiple answers
  fastify.post<{
    Headers: { authorization: string };
    Body: AnswersCreateRequest;
    Reply: AnswerAddSuccessResponse | ApiErrorResponseType;
  }>(
    '/answers',
    {
      preHandler: authenticateToken,
      schema: {
        headers: AuthHeadersSchema,
        body: AnswersCreateRequestSchema,
        response: {
          201: AnswerAddSuccessResponseSchema,
          400: ApiErrorSchema,
          401: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const userId =
          (request as any).user?.userId ??
          (request as any).user?.id ??
          (request as any).userId;

        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Unauthorized', code: 401 },
          });
        }

        const { answers } = request.body;

        if (!answers || answers.length === 0) {
          return reply.status(400).send({
            success: false,
            error: { message: 'No answers provided', code: 400 },
          });
        }

        const createdAnswers = [];
        const errors = [];

        for (const answerData of answers) {
          const {
            questionId,
            optionId = null,
            textValue = null,
            numberValue = null,
            dateValue,
            inputLanguage = null,
          } = answerData;

          try {
            // Validate question exists using Prisma directly
            const question = await fastify.prisma.question.findUnique({
              where: { id: questionId },
              select: { id: true, isActive: true },
            });

            if (!question || !question.isActive) {
              errors.push(
                `Question with ID ${questionId} not found or inactive`
              );
              continue;
            }

            // Validate option exists if provided
            if (optionId) {
              // Use Prisma directly to check if option exists and belongs to question
              const option = await fastify.prisma.option.findFirst({
                where: {
                  id: optionId,
                  questionId: questionId,
                },
              });

              if (!option) {
                errors.push(
                  `Option with ID ${optionId} not found or does not belong to question ${questionId}`
                );
                continue;
              }
            }

            // Create the answer
            const answerCreateData: any = {
              user: { connect: { id: Number(userId) } },
              question: { connect: { id: questionId } },
              textValue,
              numberValue,
              dateValue: dateValue ? new Date(dateValue) : undefined,
              inputLanguage,
            };

            // Only connect option if optionId is provided and valid
            if (optionId) {
              answerCreateData.option = { connect: { id: optionId } };
            }

            const answer = await answerDBService.create(answerCreateData);

            if (answer) {
              createdAnswers.push({
                answerId: answer.id,
                questionId,
                submittedAt: answer.createdAt.toISOString(),
              });
            }
          } catch (answerError) {
            fastify.log.error(answerError);
            errors.push(
              `Failed to create answer for question ${questionId}: ${
                (answerError as Error).message
              }`
            );
          }
        }

        // If all answers failed
        if (createdAnswers.length === 0 && errors.length > 0) {
          return reply.status(400).send({
            success: false,
            error: {
              message: `Failed to create any answers. Errors: ${errors.join(
                ', '
              )}`,
              code: 400,
            },
          });
        }

        // Return success response
        return reply.status(201).send({
          success: true,
          message: `${createdAnswers.length} answers created successfully${
            errors.length > 0 ? ` (${errors.length} failed)` : ''
          }`,
          data: {
            answersCreated: createdAnswers.length,
            answers: createdAnswers,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Failed to create answers', code: 500 },
        });
      }
    }
  );

  // ✅ GET /answers → with questions and optional locale filtering
  fastify.get<{
    Headers: { authorization: string };
    Querystring: AnswerGetRequest;
    Reply: AnswerGetSuccessResponse | ApiErrorResponseType;
  }>(
    '/answers',
    {
      preHandler: authenticateToken,
      schema: {
        headers: AuthHeadersSchema,
        querystring: AnswerGetRequestSchema,
        response: {
          200: AnswerGetSuccessResponseSchema,
          400: ApiErrorSchema,
          401: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const userId =
          (request as any).user?.userId ??
          (request as any).user?.id ??
          (request as any).userId;

        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Unauthorized', code: 401 },
          });
        }

        const { lang } = request.query;

        // Build translation filters based on lang
        const translationWhere = lang ? { locale: lang } : undefined;

        // Use Prisma directly to ensure we get the exact structure needed
        const answers = await fastify.prisma.answer.findMany({
          where: {
            userId: userId,
            question: {
              isActive: true,
            },
          },
          include: {
            question: {
              include: {
                translations: translationWhere
                  ? { where: translationWhere }
                  : true,
                subcategory: true,
              },
            },
            option: {
              include: {
                translations: translationWhere
                  ? { where: translationWhere }
                  : true,
                answers: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return reply.status(200).send({
          success: true,
          message: 'Answers retrieved successfully',
          data: { answers: answers },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Failed to retrieve answers', code: 500 },
        });
      }
    }
  );
}
