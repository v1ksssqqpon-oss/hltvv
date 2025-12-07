import axios from "axios";
import fs from "fs";
import path from "path";

const API_BASE = "https://hltv-api.vercel.app/api";

async function fetchMatches() {
    try {
        const res = await axios.get(`${API_BASE}/matches`);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch matches:", err.message || err);
        return [];
    }
}

async function main() {
    console.log("Fetching matches from HLTV API…");
    const matches = await fetchMatches();
    const outputPath = path.join("data", "matches.json");
    fs.mkdirSync("data", { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(matches, null, 2));
    console.log("Matches updated! Saved to:", outputPath);
}

main().catch(e => { console.error(e); process.exit(1); });
