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
  ApiResponseErrorSchema,
  ApiResponseType,
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
  MyJobDeleteSuccessResponse,
  MyJobDeleteSuccessResponseSchema,
  MyJobGetResponseSchema,
  MyJobGetSuccessResponseSchema,
  MyJobsGetRequest,
  MyJobsGetRequestSchema,
  MyJobsGetResponseSchema,
  MyJobsGetSuccessResponseSchema,
} from '@api';
import {
  AnswersDBService,
  QuestionsDBService,
  JobsDBService,
  SubCategoriesDBService, // Fixed: Changed from SubCategoriesDBService
} from '../services/DatabaseService';
import { tr } from 'zod/v4/locales';

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
    Reply: ApiResponseType<typeof MyJobGetResponseSchema>;
  }>(
    '/job/:id', // Route with :id parameter
    {
      schema: {
        params: IdParamsSchema,
        headers: AuthHeadersSchema,
        querystring: JobGetIdRequestSchema,
        response: {
          200: MyJobGetSuccessResponseSchema,
          404: ApiResponseErrorSchema,
        },
      },
    },

    async function (request, reply) {
      // request.params.id will be validated as a string
      const jobId = parseInt(request.params.id);
      try {
        if (isNaN(jobId)) {
          return reply.status(400).send({
            success: false,
            error: { message: 'Invalid job ID', code: 400 },
          });
        }

        const job = await jobDBService.findUniqueWithAnswersAndQuestions(
          { id: jobId },
          request.query.locale
        );

        if (!job) {
          return reply.status(404).send({
            success: false,
            error: { message: `Job with id ${jobId} not found`, code: 404 },
          });
        }

        return reply.send({
          success: true,
          message: 'Job retrieved successfully',
          data: { job },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Failed to retrieve job', code: 500 },
        });
      }
    }
  );

  // ✅ GET /my-jobs → Get current user's jobs
  fastify.get<{
    Headers: { authorization: string };
    Querystring: MyJobsGetRequest;
    Reply: ApiResponseType<typeof MyJobsGetResponseSchema>;
  }>(
    '/my-jobs',
    {
      preHandler: authenticateToken,
      schema: {
        headers: AuthHeadersSchema,
        querystring: MyJobsGetRequestSchema,
        response: {
          200: MyJobsGetSuccessResponseSchema,
          400: ApiResponseErrorSchema,
          401: ApiResponseErrorSchema,
          500: ApiResponseErrorSchema,
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

        const jobsRaw = await fastify.prisma.job.findMany({
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

        // Convert Date fields to ISO strings for each job
        //Have to be fixed: Date fields conversion
        const jobs = jobsRaw.map((job) => ({
          ...job,
          createdAt:
            job.createdAt instanceof Date
              ? job.createdAt.toISOString()
              : job.createdAt,
          updatedAt:
            job.updatedAt instanceof Date
              ? job.updatedAt.toISOString()
              : job.updatedAt,
          subcategory: job.subcategory
            ? {
                ...job.subcategory,
                createdAt:
                  job.subcategory.createdAt instanceof Date
                    ? job.subcategory.createdAt.toISOString()
                    : job.subcategory.createdAt,
                updatedAt:
                  job.subcategory.updatedAt instanceof Date
                    ? job.subcategory.updatedAt.toISOString()
                    : job.subcategory.updatedAt,
                i18n: Array.isArray(job.subcategory.i18n)
                  ? job.subcategory.i18n.map((i18n) => ({
                      ...i18n,
                      // If i18n has date fields, convert them here
                    }))
                  : job.subcategory.i18n,
              }
            : job.subcategory,
        }));

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
    Reply: ApiResponseType<typeof JobCreateSuccessResponseSchema>;
  }>(
    '/jobs',
    {
      preHandler: authenticateToken,
      schema: {
        headers: AuthHeadersSchema,
        body: JobCreateRequestSchema,
        response: {
          201: JobCreateSuccessResponseSchema,
          400: ApiResponseErrorSchema,
          401: ApiResponseErrorSchema,
          500: ApiResponseErrorSchema,
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

        // --- No existing job: proceed to create the job and its answers ---
        // Create the job first, then create answers attached to that job.
        const jobData = {
          title: title.trim(),
          description: description?.trim() || null,
          user: { connect: { id: Number(userId) } },
          subcategory: { connect: { id: subcategoryId } },
        };

        const createdJob = await jobDBService.create(jobData);

        // If answers provided, create them attached to createdJob
        const createdAnswers: number[] = [];
        if (answers && answers.length > 0) {
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

              // Check for existing answer
              const existingAnswer = await fastify.prisma.answer.findFirst({
                where: {
                  userId: Number(userId),
                  questionId,
                  optionId: optionId ?? null,
                },
              });

              if (existingAnswer) {
                createdAnswers.push(existingAnswer.id);
                continue; // Skip creating a duplicate answer
              }

              // Create the answer attached to the job
              const answerCreateData: any = {
                user: { connect: { id: Number(userId) } },
                question: { connect: { id: questionId } },
                job: { connect: { id: createdJob.id } },
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
              // Rollback: delete created answers and the job to avoid partial state
              try {
                if (createdAnswers.length > 0) {
                  await fastify.prisma.answer.deleteMany({
                    where: {
                      id: { in: createdAnswers },
                      userId: Number(userId),
                    },
                  });
                }
                await jobDBService.delete(createdJob.id);
              } catch (cleanupErr) {
                fastify.log.error(
                  'Cleanup after answer creation failed',
                  undefined,
                  cleanupErr
                );
              }

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
        // Prisma unique constraint (race or DB-level uniqueness) -> treat as client error
        if ((error as any)?.code === 'P2002') {
          return reply.status(400).send({
            success: false,
            error: {
              message:
                'A job for this subcategory already exists for this user.',
              code: 400,
            },
          });
        }
        return reply.status(500).send({
          success: false,
          error: { message: 'Failed to create job', code: 500 },
        });
      }
    }
  );

  //delete job
  fastify.delete<{
    Params: IdParamUrl;
    Headers: { authorization: string };
    Body: JobCreateRequest;
    Reply: ApiResponseType<typeof MyJobDeleteSuccessResponseSchema>;
  }>(
    `/jobs/:id`,
    {
      preHandler: authenticateToken,
      schema: {
        headers: AuthHeadersSchema,
        response: {
          200: MyJobDeleteSuccessResponseSchema,
          400: ApiResponseErrorSchema,
          401: ApiResponseErrorSchema,
          500: ApiResponseErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const userId =
          (request as any).user?.userId ??
          (request as any).user?.id ??
          (request as any).userId;
        console.log(
          'Deleting job for userId:',
          userId,
          'jobId:',
          request.params.id
        );
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Unauthorized', code: 401 },
          });
        }
        const jobId = parseInt(request.params.id);
        if (isNaN(jobId)) {
          return reply.status(400).send({
            success: false,
            error: { message: 'Invalid job ID', code: 400 },
          });
        }
        const job = await jobDBService.findUnique({
          where: { id: jobId, userId: Number(userId) },
        });
        if (!job || job.userId !== Number(userId)) {
          return reply.status(404).send({
            success: false,
            error: { message: 'Job not found', code: 404 },
          });
        }
        await jobDBService.delete(jobId);
        return reply.status(200).send({
          success: true,
          message: 'Job deleted successfully',
          data: { jobDeleted: true as const },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Failed to delete job', code: 500 },
        });
      }
    }
  );
}
