import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Run schema.sql on startup
const schemaPath = path.resolve("schema.sql");
const schema = fs.readFileSync(schemaPath, "utf-8");

pool.query(schema)
  .then(() => {
    console.log("✅ Database schema ensured");
  })
  .catch((err) => {
    console.error("❌ Error running schema:", err.message);
  });

export default pool;
