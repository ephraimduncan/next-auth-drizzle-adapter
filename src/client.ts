import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgres://postgres@localhost:5432/drizzle",
});

export const db = drizzle(pool);
