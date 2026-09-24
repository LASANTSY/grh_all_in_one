import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function run(): Promise<void> {
  const logger = (msg: string): void => {
    // eslint-disable-next-line no-console
    console.log(`[migrations] ${msg}`);
  };

  logger('Initialisation de la source de donnees...');

  // Importer la source de donnees compilee
  const { AppDataSource } = await import('../database/data-source');

  const dataSource: DataSource = await AppDataSource.initialize();

  try {
    logger('Execution des migrations en attente...');
    const migrations = await dataSource.runMigrations({ transaction: 'all' });

    if (migrations.length === 0) {
      logger('Aucune migration en attente.');
    } else {
      for (const m of migrations) {
        logger(`Migration appliquee : ${m.name}`);
      }
      logger(`${migrations.length} migration(s) appliquee(s).`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger(`ERREUR lors des migrations : ${message}`);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }

  logger('Migrations terminees.');
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[migrations] Erreur fatale :', error);
  process.exit(1);
});