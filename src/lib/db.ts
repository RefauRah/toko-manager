import knex from "knex";
import type { Knex } from "knex";
import path from "path";
import fs from "fs";

declare global {
  // eslint-disable-next-line no-var
  var __db: Knex | undefined;
}

function createDb(): Knex {
  const isPostgres =
    process.env.DB_CLIENT === "pg" ||
    (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgres"));

  if (isPostgres) {
    const connection = process.env.DATABASE_URL
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

    return knex({
      client: "pg",
      connection,
      pool: { min: 2, max: 10 },
    });
  }

  // Guard for Vercel serverless environment
  if (process.env.VERCEL) {
    console.warn(
      "[TokoManager] PERINGATAN: Berjalan di lingkungan Vercel tanpa DATABASE_URL. Pastikan environment variable DATABASE_URL (Supabase PostgreSQL) telah dikonfigurasi di Vercel Project Settings."
    );
  }

  const dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return knex({
    client: "better-sqlite3",
    connection: {
      filename: path.resolve(dataDir, "toko.sqlite"),
    },
    useNullAsDefault: true,
  });
}

export const db: Knex = global.__db || createDb();

if (process.env.NODE_ENV !== "production") {
  global.__db = db;
}
