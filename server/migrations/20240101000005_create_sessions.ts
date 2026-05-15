import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE sessions (
      id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      refresh_token   VARCHAR(512) NOT NULL UNIQUE,
      expires_at      TIMESTAMPTZ  NOT NULL,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
      revoked_at      TIMESTAMPTZ
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE IF EXISTS sessions');
}
