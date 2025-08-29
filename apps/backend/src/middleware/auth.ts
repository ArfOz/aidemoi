import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtService } from '../services/JwtService';
import { TokenDBService } from '../services/TokenDBService';
import { parseBearerToken, TokenPayload } from '@api';
import { AppDataSource } from '../config/database';

export type AuthenticatedRequest = FastifyRequest & { user: TokenPayload };

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const tokenService = new TokenDBService(AppDataSource);
  try {
    const token = parseBearerToken(request.headers.authorization);
    if (!token) {
      return reply.status(401).send({
        success: false,
        error: { message: 'No token provided', statusCode: 401 },
      });
    }
    // Check if the token exists in the database token table
    const exists = await tokenService.getTokenByValue(token);
    if (!exists) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Token not found in database', statusCode: 401 },
      });
    }

    const decoded = JwtService.verifyToken(token) as TokenPayload | null;
    if (!decoded) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Invalid token', statusCode: 401 },
      });
    }

    (request as AuthenticatedRequest).user = decoded;
  } catch {
    return reply.status(401).send({
      success: false,
      error: { message: 'Unauthorized', statusCode: 401 },
    });
  }
}
