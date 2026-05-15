import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE wines (
      id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name            VARCHAR(255) NOT NULL,
      producer        VARCHAR(255),
      vintage         SMALLINT     CHECK (vintage IS NULL OR (vintage >= 1800 AND vintage <= 2099)),
      varietal        VARCHAR(255),
      region          VARCHAR(255),
      bottle_count    SMALLINT     NOT NULL DEFAULT 1 CHECK (bottle_count >= 0 AND bottle_count <= 9999),
      status          wine_status  NOT NULL DEFAULT 'active',
      tasting_notes   TEXT,
      rating          SMALLINT     CHECK (rating IS NULL OR (rating >= 1 AND rating <= 100)),
      date_added      TIMESTAMPTZ  NOT NULL DEFAULT now(),
      date_updated    TIMESTAMPTZ  NOT NULL DEFAULT now(),
      deleted_at      TIMESTAMPTZ,
      search_vector   TSVECTOR GENERATED ALWAYS AS (
                          to_tsvector('english',
                              coalesce(name,     '') || ' ' ||
                              coalesce(producer, '') || ' ' ||
                              coalesce(region,   '')
                          )
                      ) STORED
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE IF EXISTS wines');
}
