import { db } from '../config/db';
import type { Session } from '../types/auth.types';

export const sessionsRepo = {
  async create(data: {
    user_id: string;
    refresh_token: string;
    expires_at: Date;
  }): Promise<Session> {
    const [session] = await db<Session>('sessions').insert(data).returning('*');
    return session;
  },

  async findActiveByToken(refresh_token: string): Promise<Session | undefined> {
    return db<Session>('sessions')
      .where({ refresh_token })
      .whereNull('revoked_at')
      .where('expires_at', '>', new Date())
      .first();
  },

  async revoke(id: string): Promise<void> {
    await db('sessions').where({ id }).update({ revoked_at: new Date() });
  },

  async revokeByUserId(user_id: string): Promise<void> {
    await db('sessions')
      .where({ user_id })
      .whereNull('revoked_at')
      .update({ revoked_at: new Date() });
  },
};
