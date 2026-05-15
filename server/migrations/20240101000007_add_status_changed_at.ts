import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE wines ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE wines DROP COLUMN IF EXISTS status_changed_at
  `);
}
