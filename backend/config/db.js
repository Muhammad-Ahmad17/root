// docker run -d 
// --name postgres 
// -e POSTGRES_DB=mydb 
// -e POSTGRES_USER=elephant 
// -e POSTGRES_PASSWORD=mypass 
// -p 5342:5432 
// postgres:16-alpine
// docker  restart postgres

const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.PGHOST,
  port:     Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD 
});

// ── Health Check 
pool.on('connect', () => {
  console.log('New client connected to the pool');
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err.message);
});

// ── Graceful Shutdown ─────────────────────────
process.on('SIGINT',  () => pool.end(() => console.log('Pool closed (SIGINT)')));
process.on('SIGTERM', () => pool.end(() => console.log('Pool closed (SIGTERM)')));

module.exports = pool;