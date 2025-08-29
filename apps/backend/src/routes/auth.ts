import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserDBService } from '../services/UserDBService';
import { JwtService } from '../services/JwtService';
import { AppDataSource } from '../config/database';
import { Type } from '@sinclair/typebox';
import { authenticateToken } from '../middleware/auth';

import {
  ApiErrorResponseType,
  ApiErrorSchema,
  LoginRequestType,
  LoginRequestSchema,
  LoginSuccessResponseSchema,
  LoginSuccessResponseType,
  RegisterRequestType,
  RegisterSuccessResponseSchema,
  RegisterSuccessResponseType,
  RegisterRequestSchema,
  parseExpirationTime,
  ProfileSuccessResponseSchema,
  ProfileSuccessResponseType,
  RefreshSuccessResponseType,
  RefreshTokenRequestSchema,
  RefreshTokenSuccessResponseSchema,
  LogoutSuccessResponseSchema,
  RefreshRequest,
  LogoutSuccessResponseType,
  LogoutHeaders,
} from '@api';
import { TokenDBService } from '../services/TokenDBService';

// Add Static for typing
export async function authRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  const userService = new UserDBService(AppDataSource);
  const tokenService = new TokenDBService(AppDataSource);

  fastify.post<{
    Body: LoginRequestType;
    Reply: LoginSuccessResponseType | ApiErrorResponseType;
  }>(
    '/login',
    {
      schema: {
        body: LoginRequestSchema,
        response: {
          200: LoginSuccessResponseSchema,
          401: ApiErrorSchema,
          500: ApiErrorSchema,
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
            error: { message: 'Invalid email or password', code: 401 },
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

        await tokenService.createToken({
          userId: user.id,
          token: accessToken,
          refreshToken: refreshToken,
          // store the correct expiries for each token
          expiresAtToken: accessTokenExpiresAt,
          expiresAtRefresh: refreshTokenExpiresAt,
        });

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
              // roles: ['user'],
            },
          },
        };

        return reply.status(200).send(response);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Login failed', code: 500 },
        });
      }
    }
  );

  // Register endpoint
  fastify.post<{
    Body: RegisterRequestType;
    Reply: RegisterSuccessResponseType | ApiErrorResponseType;
  }>(
    '/register',
    {
      schema: {
        body: RegisterRequestSchema,
        response: {
          201: RegisterSuccessResponseSchema,
          400: ApiErrorSchema,
          409: ApiErrorSchema,
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
              code: 409,
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
            code: 500,
          },
          message: 'Registration failed',
        });
      }
    }
  );

  // Get current user profile
  fastify.get<{
    Headers: { authorization: string };
    Reply: ProfileSuccessResponseType | ApiErrorResponseType;
  }>(
    '/profile',
    {
      preHandler: authenticateToken, // use auth middleware
      schema: {
        headers: Type.Object({
          authorization: Type.String(),
        }),
        response: {
          200: ProfileSuccessResponseSchema,
          401: ApiErrorSchema,
          404: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        // read user from middleware (support common shapes)
        const anyReq = request as any;
        const userId = anyReq.user?.userId ?? anyReq.user?.id ?? anyReq.userId;

        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Unauthorized', code: 401 },
          });
        }

        const user = await userService.findById(Number(userId));
        if (!user) {
          return reply.status(404).send({
            success: false,
            error: { message: 'User not found', code: 404 },
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
          error: { message: 'Failed to get user profile', code: 500 },
        });
      }
    }
  );

  // Refresh token endpoint
  fastify.post<{
    Body: RefreshRequest;
    Reply: RefreshSuccessResponseType | ApiErrorResponseType;
  }>(
    '/refresh',
    {
      schema: {
        body: RefreshTokenRequestSchema,
        response: {
          200: RefreshTokenSuccessResponseSchema,
          401: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body;

      try {
        // Verify the refresh token
        const isExist = await tokenService.getValidTokenByValue(refreshToken);

        if (!isExist) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Invalid refresh token', code: 401 },
          });
        }

        const decoded = JwtService.verifyToken(refreshToken);
        if (!decoded || !decoded.userId) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Invalid refresh token', code: 401 },
          });
        }

        const payload = {
          userId: decoded.userId,
          email: decoded.email,
          username: decoded.username,
        };

        // Issue a fresh pair (no DB interaction)
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

        await tokenService.createToken({
          userId: decoded.userId,
          token: accessToken,
          refreshToken: newRefreshToken,
          expiresAtToken: accessTokenExpiresAt,
          expiresAtRefresh: refreshTokenExpiresAt,
        });

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
          error: { message: 'Token refresh failed', code: 500 },
        });
      }
    }
  );

  // Logout endpoint

  fastify.post<{
    Headers: LogoutHeaders;
    Reply: LogoutSuccessResponseType | ApiErrorResponseType;
  }>(
    '/logout',
    {
      preHandler: authenticateToken,
      schema: {
        headers: Type.Object({
          authorization: Type.String(),
        }),
        response: {
          200: LogoutSuccessResponseSchema,
          401: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (_request, reply) => {
      // No DB revoke; reply success only
      return reply.status(200).send({
        success: true,
        message: 'Logged out successfully',
        data: { loggedOut: true },
      });
    }
  );
}
