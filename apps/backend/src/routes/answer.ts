import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authenticateToken } from '../middleware/auth';
import { Type } from '@sinclair/typebox';
import {
  AnswerAddSuccessResponse,
  AnswerAddSuccessResponseSchema,
  ApiErrorResponseType,
  ApiErrorSchema,
  QuestionsCreateRequest,
  QuestionsCreateRequestSchema,
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
  const questionsDBService = new QuestionsDBService(fastify.prisma);

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

  // Create a new answer
  fastify.post<{
    Headers: { authorization: string };
    Body: QuestionsCreateRequest;
    Reply: AnswerAddSuccessResponse | ApiErrorResponseType;
  }>(
    '/answers',
    {
      preHandler: authenticateToken,
      schema: {
        headers: Type.Object({
          authorization: Type.String(),
        }),
        body: QuestionsCreateRequestSchema,
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
        const anyReq = request as any;
        const userId = anyReq.user?.userId ?? anyReq.user?.id ?? anyReq.userId;

        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Unauthorized', code: 401 },
          });
        }

        console.log('Creating answer for userId:', userId);

        const { questionId, optionId, textValue, numberValue, dateValue } =
          request.body;

        const answer = await answerService.create({
          user: { connect: { id: Number(userId) } },
          question: { connect: { id: questionId } },
          ...(optionId && { option: { connect: { id: optionId } } }),
          textValue,
          numberValue,
          dateValue: dateValue ? new Date(dateValue) : undefined,
        });
        if (!answer) {
          return reply.status(400).send({
            success: false,
            error: { message: 'Failed to create answer', code: 400 },
          });
        }

        return reply.status(201).send({
          success: true,
          message: 'Answer created successfully',
          data: {
            answerId: answer.id,
            submittedAt: answer.createdAt.toString(),
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Failed to create answer', code: 500 },
        });
      }
    }
  );

  //   // Get user's answers by subcategory
  //   fastify.get<{
  //     Params: { subcategoryId: string };
  //     Reply: any | ApiErrorResponseType;
  //   }>(
  //     '/answers/subcategory/:subcategoryId',
  //     {
  //       preHandler: authenticateToken,
  //       schema: {
  //         headers: Type.Object({
  //           authorization: Type.String(),
  //         }),
  //         params: Type.Object({
  //           subcategoryId: Type.String(),
  //         }),
  //         response: {
  //           200: Type.Object({
  //             success: Type.Boolean(),
  //             message: Type.String(),
  //             data: Type.Object({
  //               answers: Type.Array(Type.Any()),
  //             }),
  //           }),
  //           401: ApiErrorSchema,
  //           500: ApiErrorSchema,
  //         },
  //       },
  //     },
  //     async (request, reply) => {
  //       try {
  //         const anyReq = request as any;
  //         const userId = anyReq.user?.userId ?? anyReq.user?.id ?? anyReq.userId;

  //         if (!userId) {
  //           return reply.status(401).send({
  //             success: false,
  //             error: { message: 'Unauthorized', code: 401 },
  //           });
  //         }

  //         const { subcategoryId } = request.params;

  //         const answers = await answerService.findAnswersBySubcategoryId(
  //           Number(subcategoryId),
  //           Number(userId)
  //         );

  //         return reply.status(200).send({
  //           success: true,
  //           message: 'Answers retrieved successfully',
  //           data: { answers },
  //         });
  //       } catch (error) {
  //         fastify.log.error(error);
  //         return reply.status(500).send({
  //           success: false,
  //           error: { message: 'Failed to retrieve answers', code: 500 },
  //         });
  //       }
  //     }
  //   );

  //   // Get user's answer for a specific question
  //   fastify.get<{
  //     Params: { questionId: string };
  //     Reply: any | ApiErrorResponseType;
  //   }>(
  //     '/answers/question/:questionId',
  //     {
  //       preHandler: authenticateToken,
  //       schema: {
  //         headers: Type.Object({
  //           authorization: Type.String(),
  //         }),
  //         params: Type.Object({
  //           questionId: Type.String(),
  //         }),
  //         response: {
  //           200: Type.Object({
  //             success: Type.Boolean(),
  //             message: Type.String(),
  //             data: Type.Object({
  //               answers: Type.Array(Type.Any()),
  //             }),
  //           }),
  //           401: ApiErrorSchema,
  //           500: ApiErrorSchema,
  //         },
  //       },
  //     },
  //     async (request, reply) => {
  //       try {
  //         const anyReq = request as any;
  //         const userId = anyReq.user?.userId ?? anyReq.user?.id ?? anyReq.userId;

  //         if (!userId) {
  //           return reply.status(401).send({
  //             success: false,
  //             error: { message: 'Unauthorized', code: 401 },
  //           });
  //         }

  //         const { questionId } = request.params;

  //         const answers = await answerService.findUserAnswerForQuestion(
  //           Number(userId),
  //           Number(questionId)
  //         );

  //         return reply.status(200).send({
  //           success: true,
  //           message: 'Answers retrieved successfully',
  //           data: { answers },
  //         });
  //       } catch (error) {
  //         fastify.log.error(error);
  //         return reply.status(500).send({
  //           success: false,
  //           error: { message: 'Failed to retrieve answers', code: 500 },
  //         });
  //       }
  //     }
  //   );

  //   // Update an answer
  //   fastify.put<{
  //     Params: { id: string };
  //     Body: {
  //       optionId?: number;
  //       textValue?: string;
  //       numberValue?: number;
  //       dateValue?: string;
  //     };
  //     Reply: any | ApiErrorResponseType;
  //   }>(
  //     '/answers/:id',
  //     {
  //       preHandler: authenticateToken,
  //       schema: {
  //         headers: Type.Object({
  //           authorization: Type.String(),
  //         }),
  //         params: Type.Object({
  //           id: Type.String(),
  //         }),
  //         body: Type.Object({
  //           optionId: Type.Optional(Type.Number()),
  //           textValue: Type.Optional(Type.String()),
  //           numberValue: Type.Optional(Type.Number()),
  //           dateValue: Type.Optional(Type.String()),
  //         }),
  //         response: {
  //           200: Type.Object({
  //             success: Type.Boolean(),
  //             message: Type.String(),
  //             data: Type.Object({
  //               answer: Type.Any(),
  //             }),
  //           }),
  //           401: ApiErrorSchema,
  //           404: ApiErrorSchema,
  //           500: ApiErrorSchema,
  //         },
  //       },
  //     },
  //     async (request, reply) => {
  //       try {
  //         const anyReq = request as any;
  //         const userId = anyReq.user?.userId ?? anyReq.user?.id ?? anyReq.userId;

  //         if (!userId) {
  //           return reply.status(401).send({
  //             success: false,
  //             error: { message: 'Unauthorized', code: 401 },
  //           });
  //         }

  //         const { id } = request.params;
  //         const { optionId, textValue, numberValue, dateValue } = request.body;

  //         const answer = await answerService.update(Number(id), {
  //           ...(optionId && { option: { connect: { id: optionId } } }),
  //           textValue,
  //           numberValue,
  //           dateValue: dateValue ? new Date(dateValue) : undefined,
  //         });

  //         return reply.status(200).send({
  //           success: true,
  //           message: 'Answer updated successfully',
  //           data: { answer },
  //         });
  //       } catch (error) {
  //         fastify.log.error(error);
  //         return reply.status(500).send({
  //           success: false,
  //           error: { message: 'Failed to update answer', code: 500 },
  //         });
  //       }
  //     }
  //   );

  //   // Delete an answer
  //   fastify.delete<{
  //     Params: { id: string };
  //     Reply: any | ApiErrorResponseType;
  //   }>(
  //     '/answers/:id',
  //     {
  //       preHandler: authenticateToken,
  //       schema: {
  //         headers: Type.Object({
  //           authorization: Type.String(),
  //         }),
  //         params: Type.Object({
  //           id: Type.String(),
  //         }),
  //         response: {
  //           200: Type.Object({
  //             success: Type.Boolean(),
  //             message: Type.String(),
  //           }),
  //           401: ApiErrorSchema,
  //           404: ApiErrorSchema,
  //           500: ApiErrorSchema,
  //         },
  //       },
  //     },
  //     async (request, reply) => {
  //       try {
  //         const anyReq = request as any;
  //         const userId = anyReq.user?.userId ?? anyReq.user?.id ?? anyReq.userId;

  //         if (!userId) {
  //           return reply.status(401).send({
  //             success: false,
  //             error: { message: 'Unauthorized', code: 401 },
  //           });
  //         }

  //         const { id } = request.params;

  //         await answerService.delete(Number(id));

  //         return reply.status(200).send({
  //           success: true,
  //           message: 'Answer deleted successfully',
  //         });
  //       } catch (error) {
  //         fastify.log.error(error);
  //         return reply.status(500).send({
  //           success: false,
  //           error: { message: 'Failed to delete answer', code: 500 },
  //         });
  //       }
  //     }
  //   );
}
