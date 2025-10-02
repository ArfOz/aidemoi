import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authenticateToken } from '../middleware/auth';
import { Type } from '@sinclair/typebox';
import {
  AnswerAddSuccessResponse,
  AnswerAddSuccessResponseSchema,
  AnswersCreateRequest,
  AnswersCreateRequestSchema,
  ApiErrorResponseType,
  ApiErrorSchema,
} from '@api';
import {
  AnswersDBService,
  QuestionsDBService,
} from '../services/DatabaseService';

export async function answerRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  const answerService = new AnswersDBService(fastify.prisma);
  const questionsService = new QuestionsDBService(fastify.prisma);

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

  // ✅ POST /answers → çoklu cevap kaydetme
  fastify.post<{
    Headers: { authorization: string };
    Body: AnswersCreateRequest;
    Reply: AnswerAddSuccessResponse | ApiErrorResponseType;
  }>(
    '/answers',
    {
      preHandler: authenticateToken,
      schema: {
        headers: Type.Object({
          authorization: Type.String(),
        }),
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
            // Validate question exists
            const question = await questionsService.findById({
              where: {
                id: questionId,
              },
            });
            if (!question) {
              errors.push(`Question with ID ${questionId} not found`);
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

            const answer = await answerService.create(answerCreateData);

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
}
