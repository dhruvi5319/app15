import { db } from '../config/db';
import type { User } from '../types/auth.types';

export const usersRepo = {
  async findByEmail(email: string): Promise<User | undefined> {
    return db<User>('users').where({ email }).first();
  },

  async findById(id: string): Promise<User | undefined> {
    return db<User>('users').where({ id }).first();
  },

  async create(data: { email: string; password_hash: string }): Promise<User> {
    const [user] = await db<User>('users')
      .insert({ email: data.email, password_hash: data.password_hash })
      .returning('*');
    return user;
  },
};
