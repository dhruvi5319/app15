import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE INDEX idx_sessions_user_id ON sessions (user_id)');
  await knex.raw('CREATE INDEX idx_sessions_token_active ON sessions (refresh_token) WHERE revoked_at IS NULL');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS idx_sessions_user_id');
  await knex.raw('DROP INDEX IF EXISTS idx_sessions_token_active');
}
