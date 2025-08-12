import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserService } from '../services/UserService';
import { JwtService } from '../services/JwtService';
import { AppDataSource } from '../config/database';
import { Type } from '@sinclair/typebox';

import {
  LoginErrorResponseSchema,
  LoginErrorResponseType,
  LoginRequest,
  LoginRequestSchema,
  LoginSuccessResponseSchema,
  LoginSuccessResponseType,
  RegisterRequest,
  RegisterSuccessResponseSchema,
  RegisterSuccessResponseType,
  RegisterErrorResponseSchema,
  RegisterErrorResponseType,
  RegisterRequestSchema,
  parseExpirationTime,
  ProfileSuccessResponseSchema,
  ProfileSuccessResponseType,
  RefreshSuccessResponse,
  RefreshRequest,
  RefreshTokenRequestSchema,
  RefreshTokenSuccessResponseSchema,
} from '@api';

// Add Static for typing
export async function authRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  const userService = new UserService(AppDataSource);

  fastify.post<{
    Body: LoginRequest;
    Reply: LoginSuccessResponseType | LoginErrorResponseType;
  }>(
    '/login',
    {
      schema: {
        body: LoginRequestSchema,
        response: {
          200: LoginSuccessResponseSchema,
          401: LoginErrorResponseSchema,
          500: LoginErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      try {
        const user = await userService.authenticateUser(email, password);
        if (!user) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Invalid email or password', statusCode: 401 },
          });
        }

        const tokenPayload = {
          userId: user.id,
          email: user.email,
          username: user.username,
        };

        const { accessToken, refreshToken } =
          JwtService.generateTokenPair(tokenPayload);

        const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
        const refreshTokenExpiresIn =
          process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

        const now = new Date();
        const accessTokenExpiresAt = new Date(
          now.getTime() + parseExpirationTime(accessTokenExpiresIn)
        );
        const refreshTokenExpiresAt = new Date(
          now.getTime() + parseExpirationTime(refreshTokenExpiresIn)
        );

        const response: LoginSuccessResponseType = {
          success: true,
          message: 'Login successful',
          data: {
            tokens: {
              token: accessToken,
              refreshToken,
              expiresIn: accessTokenExpiresIn,
              expiresAt: accessTokenExpiresAt.toISOString(),
              refreshExpiresIn: refreshTokenExpiresIn,
              refreshExpiresAt: refreshTokenExpiresAt.toISOString(),
            },
            user: {
              id: user.id.toString(),
              username: user.username,
              email: user.email,
              roles: ['user'],
            },
          },
        };

        return reply.status(200).send(response);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Login failed', statusCode: 500 },
        });
      }
    }
  );

  // Register endpoint
  fastify.post<{
    Body: RegisterRequest;
    Reply: RegisterSuccessResponseType | RegisterErrorResponseType;
  }>(
    '/register',
    {
      schema: {
        body: RegisterRequestSchema,
        response: {
          201: RegisterSuccessResponseSchema,
          400: RegisterErrorResponseSchema,
          409: RegisterErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { username, email, password } = request.body;

      try {
        // Check if user already exists
        const existingUser = await userService.findByEmail(email);
        if (existingUser) {
          return reply.status(409).send({
            success: false,
            error: {
              message: 'User with this email already exists',
              statusCode: 409,
            },
            message: 'User with this email already exists',
          });
        }

        // Create new user
        const newUser = await userService.create({ username, email, password });

        // Log successful registration
        fastify.log.info(`New user registered: ${newUser.username}`);

        const response: RegisterSuccessResponseType = {
          success: true,
          message: 'Registration successful',
          data: {
            user: {
              id: newUser.id.toString(),
              username: newUser.username,
              email: newUser.email,
              roles: ['user'],
            },
          },
        };

        return reply.status(201).send(response);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: {
            message: 'Registration failed',
            statusCode: 500,
          },
          message: 'Registration failed',
        });
      }
    }
  );

  // Get current user profile
  fastify.get<{
    Headers: { authorization: string };
    Reply: ProfileSuccessResponseType | LoginErrorResponseType;
  }>(
    '/profile',
    {
      schema: {
        headers: Type.Object({
          authorization: Type.String(),
        }),
        response: {
          200: ProfileSuccessResponseSchema,
          401: LoginErrorResponseSchema,
          404: LoginErrorResponseSchema,
          500: LoginErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return reply.status(401).send({
            success: false,
            error: {
              message: 'Missing or invalid Authorization header',
              statusCode: 401,
            },
          });
        }

        const token = authHeader.split(' ')[1];
        const decoded = JwtService.verifyToken(token);
        if (!decoded || !decoded.userId) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Invalid token', statusCode: 401 },
          });
        }

        const user = await userService.findById(decoded.userId);
        if (!user) {
          return reply.status(404).send({
            success: false,
            error: { message: 'User not found', statusCode: 404 },
          });
        }

        return reply.status(200).send({
          success: true,
          message: 'Profile fetched',
          data: {
            user: {
              id: user.id.toString(),
              username: user.username,
              email: user.email,
              roles: ['user'],
            },
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Failed to get user profile', statusCode: 500 },
        });
      }
    }
  );

  // Refresh token schemas (ApiResponse<{ tokens: ... }>

  // Refresh token endpoint
  fastify.post<{
    Body: RefreshRequest;
    Reply: RefreshSuccessResponse | LoginErrorResponseType;
  }>(
    '/refresh',
    {
      schema: {
        body: RefreshTokenRequestSchema,
        response: {
          200: RefreshTokenSuccessResponseSchema,
          401: LoginErrorResponseSchema,
          500: LoginErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body;

      try {
        const decoded = JwtService.verifyToken(refreshToken);
        if (!decoded || !decoded.userId) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Invalid refresh token', statusCode: 401 },
          });
        }

        const payload = {
          userId: decoded.userId,
          email: decoded.email,
          username: decoded.username,
        };

        // Issue a fresh pair
        const { accessToken, refreshToken: newRefreshToken } =
          JwtService.generateTokenPair(payload);

        const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
        const refreshTokenExpiresIn =
          process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

        const now = new Date();
        const accessTokenExpiresAt = new Date(
          now.getTime() + parseExpirationTime(accessTokenExpiresIn)
        );
        const refreshTokenExpiresAt = new Date(
          now.getTime() + parseExpirationTime(refreshTokenExpiresIn)
        );

        return reply.status(200).send({
          success: true,
          message: 'Token refreshed',
          data: {
            tokens: {
              token: accessToken,
              refreshToken: newRefreshToken,
              expiresIn: accessTokenExpiresIn,
              expiresAt: accessTokenExpiresAt.toISOString(),
              refreshExpiresIn: refreshTokenExpiresIn,
              refreshExpiresAt: refreshTokenExpiresAt.toISOString(),
            },
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Token refresh failed', statusCode: 500 },
        });
      }
    }
  );
}

//   // Logout endpoint (optional - for token blacklisting)
//   fastify.post(
//     '/logout',
//     {
//       preHandler: authenticateToken,
//       schema: {
//         tags: ['auth'],
//         summary: 'User logout',
//         description: 'Invalidate current token',
//         headers: {
//           type: 'object',
//           properties: {
//             authorization: { type: 'string' },
//           },
//           required: ['authorization'],
//         },
//         response: {
//           200: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               message: { type: 'string' },
//             },
//           },
//         },
//       } as any,
//     },
//     async (request: FastifyRequest, reply: FastifyReply) => {
//       // In a real application, you would add the token to a blacklist
//       // For now, we'll just return a success message
//       return reply.status(200).send({
//         success: true,
//         message: 'Logged out successfully',
//       });
//     }
//   );
// }

// function parseExpirationTime(expiresIn: string): number {
//   const timeUnit = expiresIn.slice(-1);
//   const timeValue = parseInt(expiresIn.slice(0, -1));

//   switch (timeUnit) {
//     case 's':
//       return timeValue * 1000; // seconds
//     case 'm':
//       return timeValue * 60 * 1000; // minutes
//     case 'h':
//       return timeValue * 60 * 60 * 1000; // hours
//     case 'd':
//       return timeValue * 24 * 60 * 60 * 1000; // days
//     default:
//       return 24 * 60 * 60 * 1000; // default to 24 hours
//   }
// }
//     default:
//       return 24 * 60 * 60 * 1000; // default to 24 hours
//   }
// }
