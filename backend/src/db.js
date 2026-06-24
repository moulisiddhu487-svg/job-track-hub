const { Pool } = require("pg");

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
      database: process.env.PGDATABASE || "jobtracker",
    });

pool.on("error", (err) => {
  console.error("Unexpected PG client error", err);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
