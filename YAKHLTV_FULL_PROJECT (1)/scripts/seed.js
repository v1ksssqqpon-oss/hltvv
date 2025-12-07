import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const matches = [
  {
    id: 1700000000001,
    externalId: "demo-1",
    team1: "Team A",
    team2: "Team B",
    time: "2025-12-10T18:00:00.000Z",
    score: "",
    status: "scheduled",
    tournamentId: 1
  },
  {
    id: 1700000000002,
    externalId: "demo-2",
    team1: "Team C",
    team2: "Team D",
    time: "2025-12-11T20:00:00.000Z",
    score: "16-12",
    status: "finished",
    tournamentId: 1
  }
];

const teams = [
  { id: 1, name: "Team A", slug: "team-a" },
  { id: 2, name: "Team B", slug: "team-b" },
  { id: 3, name: "Team C", slug: "team-c" },
  { id: 4, name: "Team D", slug: "team-d" }
];

const players = [
  { id: 1001, name: "Player One", teamId: 1, rating: 1.23, avatar: "" },
  { id: 1002, name: "Player Two", teamId: 2, rating: 1.05, avatar: "" },
  { id: 1003, name: "Player Three", teamId: 3, rating: 1.40, avatar: "" },
  { id: 1004, name: "Player Four", teamId: 4, rating: 1.10, avatar: "" }
];

const tournaments = [
  { id: 1, name: "YAK Cup Demo", date: "2025-12-10" }
];

fs.writeFileSync(path.join(dataDir, "matches.json"), JSON.stringify(matches, null, 2));
fs.writeFileSync(path.join(dataDir, "teams.json"), JSON.stringify(teams, null, 2));
fs.writeFileSync(path.join(dataDir, "players.json"), JSON.stringify(players, null, 2));
fs.writeFileSync(path.join(dataDir, "tournaments.json"), JSON.stringify(tournaments, null, 2));

console.log("Seed data written to ./data");
