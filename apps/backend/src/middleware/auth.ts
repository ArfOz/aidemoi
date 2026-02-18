import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtService, UserTokenPayload, CompanyTokenPayload } from '../services/JwtService';
import {
  TokenDBService,
  CompanyTokenDBService,
} from '../services/DatabaseService/TokenDatabaseService';
import { parseBearerToken, TokenPayload } from '@api';

export type AuthenticatedRequest = FastifyRequest & { user: TokenPayload };

export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = parseBearerToken(request.headers.authorization);
    if (!token) {
      return reply.status(401).send({
        success: false,
        error: { message: 'No token provided', code: 401 },
      });
    }

    // no-op: do not log token contents

    // Decide route early so we can call verifyToken with the correct generic
    const rawPath = typeof request.url === 'string' ? request.url : '';
    const normalizedPath = rawPath.replace(/^\/+/, '');
    const isCompanyRoute = normalizedPath.startsWith('api/v1/companies');

    // Verify signature and expiry first (fail-fast, cheaper than DB lookup)
    const decoded = isCompanyRoute
      ? JwtService.verifyToken<CompanyTokenPayload>(token)
      : JwtService.verifyToken<UserTokenPayload>(token);
    if (!decoded) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Invalid token', code: 401 },
      });
    }
    // Choose token DB service based on route
    const tokenService = isCompanyRoute
      ? new CompanyTokenDBService(request.server.prisma)
      : new TokenDBService(request.server.prisma);

    // Ensure token exists in DB and belongs to the decoded principal
    let exists;
    try {
      if (isCompanyRoute) {
        exists = await new CompanyTokenDBService(request.server.prisma).getTokenByValue(token);
      } else {
        exists = await new TokenDBService(request.server.prisma).getTokenByValue(token);
      }
    } catch (dbErr) {
      request.log.error({ err: dbErr }, 'auth: error querying token database');
      return reply
        .status(500)
        .send({ success: false, error: { message: 'Internal error', code: 500 } });
    }
    if (!exists) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Token not found in database', code: 401 },
      });
    }

    // Validate ownership: user tokens should map to `userId`, company tokens to `companyId`
    if (decoded.type === 'user') {
      // exists may be a company token object for some edge cases — reject if mismatch
      if (!('userId' in exists) || exists.userId !== decoded.userId) {
        return reply.status(401).send({
          success: false,
          error: { message: 'Token does not belong to the authenticated user', code: 401 },
        });
      }
    } else if (decoded.type === 'company') {
      if (!('companyId' in exists) || exists.companyId !== decoded.companyId) {
        return reply.status(401).send({
          success: false,
          error: { message: 'Token does not belong to the authenticated company', code: 401 },
        });
      }
    }

    (request as AuthenticatedRequest).user = decoded as TokenPayload;
    // For compatibility with handlers expecting `userId` or `id`, map companyId to those fields
    if ((decoded as any).type === 'company') {
      const anyReq = request as any;
      anyReq.user = anyReq.user || {};
      anyReq.user.userId = (decoded as any).companyId;
      anyReq.user.id = (decoded as any).companyId;
    }
  } catch (err) {
    request.log.error({ err }, 'auth: unexpected error during authentication');
    return reply.status(401).send({
      success: false,
      error: { message: 'Unauthorized', code: 401 },
    });
  }
}
