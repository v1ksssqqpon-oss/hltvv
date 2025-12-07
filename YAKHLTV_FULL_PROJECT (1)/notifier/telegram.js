import { Telegraf } from 'telegraf';
import fs from 'fs';
import path from 'path';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const DATA_FILE = path.join(process.cwd(), 'data', 'matches.json');

export function startTelegramNotifier(){
  if(!token || !chatId){
    console.log('Telegram notifier disabled (missing token/chat id)');
    return;
  }
  const bot = new Telegraf(token);
  console.log('Telegram notifier enabled');

  // simple poll: check for newly started matches every 60s
  let lastSnapshot = '';
  setInterval(()=> {
    try{
      if(!fs.existsSync(DATA_FILE)) return;
      const items = JSON.parse(fs.readFileSync(DATA_FILE));
      const snap = JSON.stringify(items.map(i=>({id:i.externalId||i.id, status:i.status, score:i.score})));
      if(snap !== lastSnapshot){
        // find changes
        const prev = JSON.parse(lastSnapshot||'[]');
        const prevMap = new Map((prev||[]).map(p=>[p.id,p]));
        for(const m of items){
          const id = m.externalId||m.id;
          const p = prevMap.get(id);
          if(!p && (m.status==='live' || m.status==='scheduled')){
            bot.telegram.sendMessage(chatId, `Новый матч: ${m.team1} vs ${m.team2} — ${m.time||'TBD'}`);
          } else if(p && p.score !== m.score){
            bot.telegram.sendMessage(chatId, `Обновлён счёт: ${m.team1} vs ${m.team2} — ${m.score || 'TBD'}`);
          }
        }
        lastSnapshot = snap;
      }
    }catch(e){
      console.error('Notifier loop error', e);
    }
  }, 60*1000);
}
