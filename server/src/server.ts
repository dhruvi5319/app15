import { app } from './app';
import { env } from './config/env';
import { db } from './config/db';

async function main() {
  // Verify DB connection
  await db.raw('SELECT 1');
  console.log('Database connection verified');

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
