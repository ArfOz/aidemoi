import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserDBService } from '../../services/DatabaseService/UserDBService';
import { JwtService } from '../../services/JwtService';
import { authenticateToken } from '../../middleware/auth';

import {
  ApiResponseErrorSchema,
  LoginRequestType,
  LoginRequestSchema,
  RegisterRequestType,
  RegisterSuccessResponseSchema,
  RegisterRequestSchema,
  parseExpirationTime,
  ProfileSuccessResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenSuccessResponseSchema,
  LogoutSuccessResponseSchema,
  RefreshRequest,
  LogoutHeaders,
  AuthHeadersSchema,
  ApiResponseSuccessSchema,
  ApiResponseType,
  RegisterResponseSchema,
  ProfileResponseSchema,
  RefreshTokenResponseSchema,
  LogoutResponseSchema,
  LoginCompanyResponseSchema,
} from '@api';
import { parseBearerToken } from '@api';
import { CompanyTokenDBService } from '../../services/DatabaseService/TokenDatabaseService/CompanyTokenDBservice';
import { CompanyDBService } from '../../services/DatabaseService/CompanyDBService';

// Add Static for typing
export async function authRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  const companyService = new CompanyDBService(fastify.prisma);
  const tokenService = new CompanyTokenDBService(fastify.prisma);

  fastify.post<{
    Body: LoginRequestType;
    Reply: ApiResponseType<typeof LoginCompanyResponseSchema>;
  }>(
    '/login',
    {
      schema: {
        body: LoginRequestSchema,
        response: {
          200: LoginCompanyResponseSchema,
          401: ApiResponseErrorSchema,
          500: ApiResponseErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      try {
        const company = await companyService.authenticateUser(email, password);

        if (!company) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Invalid email or password', code: 401 },
          });
        }

        const tokenPayload = {
          companyId: company.id,
          email: company.email,
          username: company.username || '',
          type: 'company' as const,
        };

        const { accessToken, refreshToken } = JwtService.generateTokenPair(tokenPayload);

        const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
        const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

        const now = new Date();
        const accessTokenExpiresAt = new Date(
          now.getTime() + parseExpirationTime(accessTokenExpiresIn),
        );
        const refreshTokenExpiresAt = new Date(
          now.getTime() + parseExpirationTime(refreshTokenExpiresIn),
        );

        await tokenService.createToken({
          companyId: company.id,
          token: accessToken,
          refreshToken: refreshToken,
          // store the correct expiries for each token
          expiresAtToken: accessTokenExpiresAt,
          expiresAtRefresh: refreshTokenExpiresAt,
        });

        const response = {
          success: true as const,
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
            company: {
              id: company.id.toString(),
              username: user.username || '',
              email: user.email,
              roles: 'company' as const,
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
    },
  );

  // Register endpoint
  fastify.post<{
    Body: RegisterRequestType;
    Reply: ApiResponseType<typeof RegisterResponseSchema>;
  }>(
    '/register',
    {
      schema: {
        body: RegisterRequestSchema,
        response: {
          201: ApiResponseSuccessSchema(RegisterSuccessResponseSchema),
          400: ApiResponseErrorSchema,
          409: ApiResponseErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { username, email, password } = request.body;

      try {
        // Check if user already exists
        const existingUser = await companyService.findAll({
          where: { email },
        });

        if (existingUser.length > 0) {
          return reply.status(409).send({
            success: false,
            error: {
              message: 'User with this email already exists',
              code: 409,
            },
          });
        }

        const existingUsername = await companyService.findAll({
          where: { username },
        });
        if (existingUsername.length > 0) {
          return reply.status(409).send({
            success: false,
            error: {
              message: 'Username is already taken',
              code: 409,
            },
          });
        }

        // Create new user
        const newUser = await companyService.create({ username, email, password });

        // Log successful registration
        fastify.log.info(`New user registered: ${newUser.username}`);

        const response = {
          success: true as const,
          message: 'Registration successful',
          data: {
            user: {
              id: newUser.id.toString(),
              username: newUser.username || '',
              email: newUser.email,
              roles: ['company'],
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
        });
      }
    },
  );

  // Get current user profile
  fastify.get<{
    Headers: { authorization: string };
    Reply: ApiResponseType<typeof ProfileResponseSchema>;
  }>(
    '/profile',
    {
      preHandler: authenticateToken, // use auth middleware
      schema: {
        headers: AuthHeadersSchema,
        response: {
          200: ProfileSuccessResponseSchema,
          401: ApiResponseErrorSchema,
          404: ApiResponseErrorSchema,
          500: ApiResponseErrorSchema,
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

        const user = await companyService.findById(Number(userId));
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
              username: user.username || '',
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
    },
  );

  // Refresh token endpoint
  fastify.post<{
    Body: RefreshRequest;
    Reply: ApiResponseType<typeof RefreshTokenResponseSchema>;
  }>(
    '/refresh',
    {
      schema: {
        body: RefreshTokenRequestSchema,
        response: {
          200: RefreshTokenSuccessResponseSchema,
          401: ApiResponseErrorSchema,
          500: ApiResponseErrorSchema,
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
        if (!decoded || !decoded.companyId) {
          return reply.status(401).send({
            success: false,
            error: { message: 'Invalid refresh token', code: 401 },
          });
        }

        const payload = {
          companyId: decoded.companyId as number,
          email: decoded.email,
          username: decoded.username,
        };

        // Issue a fresh pair (no DB interaction)
        const { accessToken, refreshToken: newRefreshToken } =
          JwtService.generateTokenPair(payload);

        const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
        const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

        const now = new Date();
        const accessTokenExpiresAt = new Date(
          now.getTime() + parseExpirationTime(accessTokenExpiresIn),
        );
        const refreshTokenExpiresAt = new Date(
          now.getTime() + parseExpirationTime(refreshTokenExpiresIn),
        );

        await tokenService.createToken({
          companyId: decoded.companyId as number,
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
    },
  );

  // Logout endpoint

  fastify.post<{
    Headers: LogoutHeaders;
    Reply: ApiResponseType<typeof LogoutResponseSchema>;
  }>(
    '/logout',
    {
      preHandler: authenticateToken,
      schema: {
        headers: AuthHeadersSchema,
        response: {
          200: LogoutSuccessResponseSchema,
          401: ApiResponseErrorSchema,
          500: ApiResponseErrorSchema,
        },
      },
    },
    async (_request, reply) => {
      try {
        const token = parseBearerToken((_request.headers as any).authorization);
        if (token) {
          await tokenService.deleteToken(token);
        }
        return reply.status(200).send({
          success: true,
          message: 'Logged out successfully',
          data: { loggedOut: true },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: { message: 'Logout failed', code: 500 },
        });
      }
    },
  );
}
