import fetch from 'node-fetch';
import cheerio from 'cheerio';
import cron from 'cron';
import fs from 'fs';
import path from 'path';

const BASE = process.env.HLTV_BASE_URL || 'https://www.hltv.org';
const USER_AGENT = process.env.HLTV_USER_AGENT || 'YAKhltvBot/1.0 (+https://example.com)';
const DATA_FILE = path.join(process.cwd(), 'data', 'matches.json');

function nowISO(){ return (new Date()).toISOString(); }

async function fetchMatchesPage() {
  const url = `${BASE}/matches`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if(!res.ok) throw new Error('HLTV fetch failed: '+res.status);
  const text = await res.text();
  const $ = cheerio.load(text);

  const items = [];
  // simplified parser: find match rows
  $('.upcomingMatches .match-day .match').each((i, el) => {
    try{
      const $el = $(el);
      const link = $el.find('a').attr('href') || '';
      const externalId = link.split('/')[2] || ('ext-'+i+'-'+Date.now());
      const t1 = $el.find('.team1 .team').text().trim() || $el.find('.team1').text().trim();
      const t2 = $el.find('.team2 .team').text().trim() || $el.find('.team2').text().trim();
      const timeAttr = $el.find('.time').attr('data-unix');
      let time = null;
      if(timeAttr) time = new Date(parseInt(timeAttr,10)).toISOString();
      items.push({ externalId, team1: t1 || 'TBD', team2: t2 || 'TBD', time, status: 'scheduled', score: '' });
    }catch(e){
      // ignore
    }
  });

  return items;
}

async function runOnce() {
  try {
    const items = await fetchMatchesPage();
    // read existing
    let existing = [];
    if (fs.existsSync(DATA_FILE)) existing = JSON.parse(fs.readFileSync(DATA_FILE));
    // naive merge: replace by externalId
    const map = new Map(existing.map(m=>[m.externalId||m.id, m]));
    for(const it of items){
      if(!map.has(it.externalId)){
        it.id = Date.now()+Math.floor(Math.random()*1000);
        it.created_at = nowISO();
      } else {
        const prev = map.get(it.externalId);
        it.id = prev.id;
        it.created_at = prev.created_at || nowISO();
      }
      it.updated_at = nowISO();
      map.set(it.externalId, it);
    }
    const out = Array.from(map.values());
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(out, null, 2));
    console.log('HLTV poll: wrote', out.length, 'matches');
  } catch(e) {
    console.error('HLTV poll error', e.message||e);
  }
}

export function startHLTVPoller() {
  // don't crash if cron not usable on free plan; run once immediately
  runOnce();
  const cronExpr = process.env.HLTV_POLL_CRON || '*/5 * * * *';
  try{
    const job = new cron.CronJob(cronExpr, runOnce, null, true, 'UTC');
    job.start();
    console.log('HLTV poller scheduled', cronExpr);
  }catch(e){
    console.error('Failed to schedule poller', e);
  }
}

// allow running as standalone
if (import.meta.url.endsWith('/services/hltv.js') && process.argv[1] && process.argv[1].endsWith('hltv.js')) {
  runOnce();
}
