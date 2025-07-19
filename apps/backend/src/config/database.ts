import { DataSource } from 'typeorm';
import { User } from '../entities/User';

const config = {
  type: (process.env.DB_TYPE as any) || 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'aide_moi_db',

  // PostgreSQL SSL configuration
  ...(process.env.DB_TYPE === 'postgres' && {
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized:
              process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : false,
  }),

  // SQLite specific
  ...(process.env.DB_TYPE === 'sqlite' && {
    database: process.env.DB_SQLITE_PATH || './database.sqlite',
  }),

  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
};

export const AppDataSource = new DataSource(config);
