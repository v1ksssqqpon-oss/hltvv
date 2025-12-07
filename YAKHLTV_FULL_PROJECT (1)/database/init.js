import pg from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || '',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

export async function initDb(){
  if(!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL provided — skipping Postgres init');
    return;
  }
  const client = await pool.connect();
  try {
    // create tables if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE,
        slug TEXT
      );
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name TEXT,
        team_id INTEGER REFERENCES teams(id),
        rating NUMERIC
      );
      CREATE TABLE IF NOT EXISTS matches (
        id BIGINT PRIMARY KEY,
        external_id TEXT UNIQUE,
        team1_id INTEGER,
        team2_id INTEGER,
        tournament_id INTEGER,
        time TIMESTAMP,
        score TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Postgres init OK');
  } finally {
    client.release();
  }
}

export { pool as db };
