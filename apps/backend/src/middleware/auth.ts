import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtService } from '../services/JwtService';
import {
  TokenDBService,
  CompanyTokenDBService,
} from '../services/DatabaseService/TokenDatabaseService';
import { parseBearerToken, TokenPayload } from '@api';

export type AuthenticatedRequest = FastifyRequest & { user: TokenPayload };

export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  // Choose token DB service based on route: company routes use company tokens
  const isCompanyRoute = typeof request.url === 'string' && request.url.startsWith('/company');
  const tokenService = isCompanyRoute
    ? new CompanyTokenDBService(request.server.prisma)
    : new TokenDBService(request.server.prisma);
  try {
    const token = parseBearerToken(request.headers.authorization);
    if (!token) {
      return reply.status(401).send({
        success: false,
        error: { message: 'No token provided', code: 401 },
      });
    }
    // Check if the token exists in the database token table
    const exists = await tokenService.getTokenByValue(token);
    if (!exists) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Token not found in database', code: 401 },
      });
    }

    const decoded = JwtService.verifyToken(token) as TokenPayload | null;
    if (!decoded) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Invalid token', code: 401 },
      });
    }

    (request as AuthenticatedRequest).user = decoded;
  } catch {
    return reply.status(401).send({
      success: false,
      error: { message: 'Unauthorized', code: 401 },
    });
  }
}
