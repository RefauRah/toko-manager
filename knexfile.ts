import type { Knex } from "knex";
import path from "path";
import fs from "fs";

// Ensure data directory exists for local sqlite
const dataDir = path.resolve(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const isPostgres = process.env.DB_CLIENT === "pg" || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgres"));

const pgConnection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
    }
  : {
      host: process.env.PG_HOST || "127.0.0.1",
      port: Number(process.env.PG_PORT) || 5432,
      user: process.env.PG_USER || "postgres",
      password: process.env.PG_PASSWORD || "postgres",
      database: process.env.PG_DATABASE || "toko_manager",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    };

const config: { [key: string]: Knex.Config } = {
  development: isPostgres
    ? {
        client: "pg",
        connection: pgConnection,
        migrations: {
          directory: "./src/db/migrations",
          extension: "ts",
        },
        seeds: {
          directory: "./src/db/seeds",
          extension: "ts",
        },
      }
    : {
        client: "better-sqlite3",
        connection: {
          filename: path.resolve(process.cwd(), "data", "toko.sqlite"),
        },
        useNullAsDefault: true,
        migrations: {
          directory: "./src/db/migrations",
          extension: "ts",
        },
        seeds: {
          directory: "./src/db/seeds",
          extension: "ts",
        },
      },
  production: {
    client: isPostgres ? "pg" : "better-sqlite3",
    connection: isPostgres
      ? pgConnection
      : { filename: path.resolve(process.cwd(), "data", "toko.sqlite") },
    useNullAsDefault: !isPostgres,
    migrations: {
      directory: "./src/db/migrations",
    },
    seeds: {
      directory: "./src/db/seeds",
    },
  },
};

export default config;
