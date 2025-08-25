import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entities/User';
import { Token } from '../entities/Token';
import { Category, CategoryI18n } from '../entities/Category';
import { Subcategory, SubcategoryI18n } from '../entities/Subcategory';

// Limit accepted DB drivers to a safe subset to satisfy TypeORM's union types
type SupportedType = Extract<
  DataSourceOptions['type'],
  'postgres' | 'sqlite' | 'mysql' | 'mariadb' | 'mssql'
>;
const rawType = (process.env.DB_TYPE || 'postgres').toLowerCase();
const isSupported = (t: string): t is SupportedType =>
  ['postgres', 'sqlite', 'mysql', 'mariadb', 'mssql'].includes(t);
const type: SupportedType = isSupported(rawType) ? rawType : 'postgres';

const common = {
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  // Prefer explicit classes over globs to avoid path mismatches in dist
  entities: [User, Token, Category, CategoryI18n, Subcategory, SubcategoryI18n],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
};

// Remove the mutable `let config` and if/else assignment.
// let config: DataSourceOptions;
// if (type === 'sqlite') { ... } else if (type === 'postgres') { ... } else if (type === 'mysql' || type === 'mariadb' || type === 'mssql') { ... }

// Replace with a total function that always returns a config for supported drivers.
function buildConfig(type: SupportedType): DataSourceOptions {
  switch (type) {
    case 'sqlite':
      return {
        type,
        database: process.env.DB_SQLITE_PATH || './database.sqlite',
        ...common,
      };
    case 'postgres':
      return {
        type,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'aide_moi_db',
        ssl:
          process.env.DB_SSL === 'true'
            ? {
                rejectUnauthorized:
                  process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
              }
            : false,
        ...common,
      };
    case 'mysql':
    case 'mariadb':
    case 'mssql':
      return {
        type,
        host: process.env.DB_HOST,
        port: parseInt(
          process.env.DB_PORT || (type === 'mssql' ? '1433' : '3306')
        ),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'aide_moi_db',
        ...common,
      };
  }
}

const config = buildConfig(type);

export const AppDataSource = new DataSource(config);
