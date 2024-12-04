import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Test database connection
pool.connect()
  .then((client) => {
    console.log('Successfully connected to PostgreSQL database');
    client.release();
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
    process.exit(-1);
  });

export const db = drizzle(pool, { schema });
