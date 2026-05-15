import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { usersRepo } from '../repositories/users.repo';
import { sessionsRepo } from '../repositories/sessions.repo';
import type {
  RegisterRequest, RegisterResponse,
  LoginRequest, LoginResponse,
  RefreshRequest, RefreshResponse,
  JwtPayload,
} from '../types/auth.types';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600; // 1h

function generateAccessToken(userId: string, email: string): string {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(
    { sub: userId, email } satisfies Omit<JwtPayload, 'iat' | 'exp'>,
    env.JWT_SECRET,
    options
  );
}

function generateRefreshToken(userId: string): string {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, options);
}

function refreshTokenExpiryDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30); // 30 days
  return d;
}

export const authService = {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const existing = await usersRepo.findByEmail(data.email);
    if (existing) {
      const err = new Error('Email already in use') as Error & { statusCode: number; code: string };
      err.statusCode = 409;
      err.code = 'EMAIL_IN_USE';
      throw err;
    }

    const password_hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    const user = await usersRepo.create({ email: data.email, password_hash });

    const access_token = generateAccessToken(user.id, user.email);
    const refresh_token = generateRefreshToken(user.id);

    await sessionsRepo.create({
      user_id: user.id,
      refresh_token,
      expires_at: refreshTokenExpiryDate(),
    });

    return {
      user: { id: user.id, email: user.email },
      access_token,
      refresh_token,
      expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    };
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await usersRepo.findByEmail(data.email);
    if (!user || !user.password_hash) {
      const err = new Error('Invalid credentials') as Error & { statusCode: number; code: string };
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) {
      const err = new Error('Invalid credentials') as Error & { statusCode: number; code: string };
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const access_token = generateAccessToken(user.id, user.email);
    const refresh_token = generateRefreshToken(user.id);

    await sessionsRepo.create({
      user_id: user.id,
      refresh_token,
      expires_at: refreshTokenExpiryDate(),
    });

    return { access_token, refresh_token, expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS };
  },

  async refresh(data: RefreshRequest): Promise<RefreshResponse> {
    // Verify JWT signature first
    let payload: { sub: string };
    try {
      payload = jwt.verify(data.refresh_token, env.JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      const err = new Error('Invalid or expired refresh token') as Error & { statusCode: number; code: string };
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    // Verify session exists in DB and is not revoked
    const session = await sessionsRepo.findActiveByToken(data.refresh_token);
    if (!session) {
      const err = new Error('Session not found or revoked') as Error & { statusCode: number; code: string };
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const user = await usersRepo.findById(payload.sub);
    if (!user) {
      const err = new Error('User not found') as Error & { statusCode: number; code: string };
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const access_token = generateAccessToken(user.id, user.email);
    return { access_token, expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS };
  },

  async logout(userId: string): Promise<void> {
    // Revoke all active sessions for this user
    await sessionsRepo.revokeByUserId(userId);
  },
};
