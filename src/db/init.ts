import { db } from "../lib/db.ts";
import { up } from "./migrations/20261111000000_init_schema.ts";
import { seed } from "./seeds/01_initial_data.ts";

export async function runInit(): Promise<void> {
  console.log("Checking database tables...");

  const hasUsers = await db.schema.hasTable("users");
  if (!hasUsers) {
    console.log("Running migration up...");
    await up(db);
    console.log("Migration finished.");
  } else {
    console.log("Tables already exist.");
  }

  // Check if admin user exists
  const admin = await db("users").where({ email: "admin@tokomanager.com" }).first();
  if (!admin) {
    console.log("Seeding initial data...");
    await seed(db);
    console.log("Initial seed finished.");
  } else {
    console.log("Initial admin already exists.");
  }
}

if (process.argv[1] && process.argv[1].endsWith("init.ts")) {
  runInit()
    .then(() => {
      console.log("Database initialization completed successfully!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Database initialization failed:", err);
      process.exit(1);
    });
}
