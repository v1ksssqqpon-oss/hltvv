# YAKhltv - Demo Full Project

This repository contains a demo HLTV-like project with:
- simple Express backend (JSON data in /data)
- HLTV poller (cheerio) that writes to /data/matches.json
- Telegram notifier (optional)
- seed script
- GitHub Action / script for HLTV fetch

## Quick start (local)

1. Copy .env.example to .env and fill DATABASE_URL etc.
2. Install dependencies:
   npm install
3. Seed demo data:
   npm run seed
4. Start server:
   npm start

## Deploy on Render
- Create a Web Service, connect to this repo.
- Set start command: `node server.js`
- Add environment variables in Render from .env

