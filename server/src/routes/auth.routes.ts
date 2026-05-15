import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authController } from '../controllers/auth.controller';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

// POST /api/v1/auth/register
authRouter.post('/register', validate(registerSchema), authController.register);

// POST /api/v1/auth/login
authRouter.post('/login', validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh
authRouter.post('/refresh', validate(refreshSchema), authController.refresh);

// POST /api/v1/auth/logout (requires valid access token)
authRouter.post('/logout', authenticate, authController.logout);
