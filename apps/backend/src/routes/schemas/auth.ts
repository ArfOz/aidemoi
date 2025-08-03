// src/modules/auth/auth.schemas.ts
import { z } from 'zod';

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const LoginSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  tokens: z.object({
    token: z.string(),
    refreshToken: z.string(),
    expiresIn: z.string(),
    expiresAt: z.string().datetime(),
    refreshExpiresIn: z.string(),
    refreshExpiresAt: z.string().datetime(),
  }),
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
    roles: z.array(z.string()),
  }),
});

export const LoginErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    statusCode: z.number(),
  }),
});

// TypeScript types (optional but useful)
export type LoginBody = z.infer<typeof LoginBodySchema>;
export type LoginSuccessResponse = z.infer<typeof LoginSuccessResponseSchema>;
export type LoginErrorResponse = z.infer<typeof LoginErrorResponseSchema>;
