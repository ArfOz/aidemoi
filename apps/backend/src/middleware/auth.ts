import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtService } from '../services/JwtService';
import { parseBearerToken, TokenPayload } from '@api';

export type AuthenticatedRequest = FastifyRequest & { user: TokenPayload };

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = parseBearerToken(request.headers.authorization);
    if (!token) {
      return reply.status(401).send({
        success: false,
        error: { message: 'No token provided', statusCode: 401 },
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
