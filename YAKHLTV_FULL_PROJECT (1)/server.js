import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { startHLTVPoller } from "./services/hltv.js";
import { startTelegramNotifier } from "./notifier/telegram.js";
import { initDb } from "./database/init.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

// simple JSON DB (data folder)
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// public endpoints
app.get("/api/matches", (req, res) => {
  const f = path.join(DATA_DIR, "matches.json");
  const obj = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : [];
  res.json(obj);
});

app.get("/api/teams", (req, res) => {
  const f = path.join(DATA_DIR, "teams.json");
  res.json(fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : []);
});

app.get("/api/players", (req, res) => {
  const f = path.join(DATA_DIR, "players.json");
  res.json(fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : []);
});

// Admin simple password endpoints (for demo)
const ADMIN_PASS = process.env.ADMIN_PASS || "yakhltvwwyak111";

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASS) return res.json({ ok: true });
  res.status(403).json({ ok: false });
});

app.post("/api/admin/match/add", (req, res) => {
  if (req.body.password !== ADMIN_PASS) return res.status(403).json({ message: "Forbidden" });
  const f = path.join(DATA_DIR, "matches.json");
  const arr = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : [];
  const match = req.body.match;
  match.id = Date.now();
  arr.push(match);
  fs.writeFileSync(f, JSON.stringify(arr, null, 2));
  res.json({ ok: true, id: match.id });
});

app.post("/api/admin/match/delete", (req, res) => {
  if (req.body.password !== ADMIN_PASS) return res.status(403).json({ message: "Forbidden" });
  const f = path.join(DATA_DIR, "matches.json");
  const arr = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : [];
  const filtered = arr.filter(m => m.id != req.body.id);
  fs.writeFileSync(f, JSON.stringify(filtered, null, 2));
  res.json({ ok: true });
});

// initialize DB (Postgres optional)
initDb().then(()=> {
  // start poller and notifier if configured
  try {
    startHLTVPoller();
  } catch(e){ console.error(e); }
  try {
    startTelegramNotifier();
  } catch(e){ console.error(e); }
}).catch(e => console.error("DB init error", e));

app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
