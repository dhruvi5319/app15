import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE INDEX idx_wines_user_id ON wines (user_id)');
  await knex.raw('CREATE INDEX idx_wines_user_status ON wines (user_id, status) WHERE deleted_at IS NULL');
  await knex.raw('CREATE INDEX idx_wines_user_date_added ON wines (user_id, date_added DESC) WHERE deleted_at IS NULL');
  await knex.raw('CREATE INDEX idx_wines_user_vintage ON wines (user_id, vintage) WHERE deleted_at IS NULL');
  await knex.raw('CREATE INDEX idx_wines_user_producer ON wines (user_id, producer) WHERE deleted_at IS NULL');
  await knex.raw('CREATE INDEX idx_wines_filter_varietal_vintage ON wines (user_id, status, varietal, vintage) WHERE deleted_at IS NULL');
  await knex.raw('CREATE INDEX idx_wines_search_fts ON wines USING GIN (search_vector)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS idx_wines_user_id');
  await knex.raw('DROP INDEX IF EXISTS idx_wines_user_status');
  await knex.raw('DROP INDEX IF EXISTS idx_wines_user_date_added');
  await knex.raw('DROP INDEX IF EXISTS idx_wines_user_vintage');
  await knex.raw('DROP INDEX IF EXISTS idx_wines_user_producer');
  await knex.raw('DROP INDEX IF EXISTS idx_wines_filter_varietal_vintage');
  await knex.raw('DROP INDEX IF EXISTS idx_wines_search_fts');
}
