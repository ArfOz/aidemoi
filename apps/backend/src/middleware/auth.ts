import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtService } from '../services/JwtService';

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    userId: number;
    email: string;
    username: string;
  };
}

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return reply.status(401).send({
        error: {
          message: 'Access token is required',
          statusCode: 401
        }
      });
    }

    const decoded = JwtService.verifyToken(token);
    if (!decoded) {
      return reply.status(403).send({
        error: {
          message: 'Invalid or expired token',
          statusCode: 403
        }
      });
    }

    // Add user info to request
    (request as AuthenticatedRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username
    };
  } catch (error) {
    return reply.status(403).send({
      error: {
        message: 'Token verification failed',
        statusCode: 403
      }
    });
  }
}
