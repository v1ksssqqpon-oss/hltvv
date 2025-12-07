// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const TEAMS_FILE = path.join(DATA_DIR, "teams.json");
const ADMIN_PASS = process.env.ADMIN_PASS || "yakhltvwwyak111";

// helper
function readTeams(){
  try {
    if(!fs.existsSync(TEAMS_FILE)) return [];
    return JSON.parse(fs.readFileSync(TEAMS_FILE));
  } catch(e){ return []; }
}
function writeTeams(arr){
  fs.writeFileSync(TEAMS_FILE, JSON.stringify(arr, null, 2));
}

// public endpoints
app.get("/api/teams", (req, res) => {
  const teams = readTeams();
  res.json(teams);
});

// admin login quick check
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if(password === ADMIN_PASS) return res.json({ ok: true });
  return res.status(403).json({ ok: false });
});

// add team
app.post("/api/teams", (req, res) => {
  const { password, name, slug, avatar } = req.body;
  if(password !== ADMIN_PASS) return res.status(403).json({ message: "Forbidden" });
  if(!name) return res.status(400).json({ message: "team name required" });
  const arr = readTeams();
  const id = Date.now();
  const team = { id, name, slug: slug || String(name).toLowerCase().replace(/[^a-z0-9]+/g,"-"), avatar: avatar||"" };
  arr.push(team);
  writeTeams(arr);
  res.json({ ok:true, team });
});

// delete team
app.delete("/api/teams/:id", (req, res) => {
  // password can come in body or query
  const password = req.body?.password || req.query?.password;
  if(password !== ADMIN_PASS) return res.status(403).json({ message: "Forbidden" });
  const id = Number(req.params.id);
  let arr = readTeams();
  const before = arr.length;
  arr = arr.filter(t=>t.id !== id);
  writeTeams(arr);
  res.json({ ok:true, deleted: before - arr.length });
});

// static admin UI (public folder)
const PUBLIC_DIR = path.join(process.cwd(), "public");
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
app.use("/", express.static(PUBLIC_DIR));

// small health
app.get("/api/health", (req,res)=> res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server started on port", PORT));
