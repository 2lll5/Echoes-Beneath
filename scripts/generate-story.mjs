import fs from "node:fs";
import path from "node:path";

const outputPath = path.join(process.cwd(), "public", "story.generated.json");
const startAt = new Date("2026-07-14T16:00:00+08:00");
const finalAt = new Date("2026-07-31T23:00:00+08:00");
const now = process.env.STORY_NOW ? new Date(process.env.STORY_NOW) : new Date();
if (Number.isNaN(now.getTime())) throw new Error(`Invalid STORY_NOW: ${process.env.STORY_NOW}`);

const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(now).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
const hourKey = `${parts.year}${parts.month}${parts.day}-${parts.hour}`;
const releaseAt = `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:00`;

function hash(text) { let value = 2166136261; for (const char of String(text)) { value ^= char.charCodeAt(0); value = Math.imul(value, 16777619); } return Math.abs(value >>> 0); }
function pick(list, seed, offset = 0) { return list[(seed + offset * 7919) % list.length]; }

const motifs = [
  "門縫下多出一道不屬於任何燈源的光", "玻璃表面浮出一圈剛被手掌擦過的霧", "水管裡傳來比心跳慢半拍的敲擊", "所有反光表面同時少映出一件物品", "遠處感應燈沿著實際可走的路線逐盞亮起", "空氣裡出現潮濕金屬與舊紙張混合的氣味", "某個出口的門把比室溫低了十幾度", "原本固定的陰影向最近的轉角移動了一小段", "附近的電器同時顯示一個尚未做出的選擇編號", "地面留下第二組與你步幅完全一致的腳印", "牆面出現一道只在側眼可見的細縫", "同一個通知聲從兩個相連場所先後響起"
];
const distortions = [
  "聲音只能沿著牆、門與走廊傳遞，沒有憑空跨越所在地", "每次你移動到相鄰場所，異常都會晚一步留下能被追查的痕跡", "倒影仍比現實快半秒，但它無法映出目前場所不存在的出口", "腳步聲會跟隨你真正走過的通道，不會跳到沒有連接的房間", "所有變化都能在上一個選擇留下的物件或線索中找到原因", "兩條分支只有在抵達同一場所並持有相容線索時才短暫重疊", "未選的動作會出現在附近表面上，卻不能改寫你已經做過的事", "那個聲音能預測你的傾向，卻無法預測你尚未看見的出口", "危險的形態改變了，但仍保留上一幕留下的聲音與痕跡", "時間短暫提前一分鐘，並只標記你目前所在的區域"
];
const whispers = [
  "「不要把出口和安全當成同一件事。」", "「我只能跟著你真正走過的地方。」", "「另一條路也到了這裡，但它帶著不同的線索。」", "「你沒有選的那一步，正在附近找位置落下。」", "「先確認門通往哪裡，再碰門把。」", "「我記得你的上一個選擇，所以不需要猜。」", "「相容的故事可以交會，不相容的只能隔牆說話。」", "「你若離開，請沿著一條真的存在的路。」", "「別讓倒影冒充已經發生的事。」", "「這一次，我會待在你看得見因果的地方。」"
];

const data = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, "utf8")) : { schemaVersion: 3, generatedAt: null, timezone: "Asia/Taipei", finalScheduledAt: "2026-07-31T23:00:00+08:00", releasedDepth: 6, final: false, layerEvents: [], updates: [] };
data.schemaVersion = 3;
data.timezone = "Asia/Taipei";
data.finalScheduledAt = "2026-07-31T23:00:00+08:00";
data.releasedDepth = Number.isInteger(data.releasedDepth) ? data.releasedDepth : 6;
data.layerEvents = Array.isArray(data.layerEvents) ? data.layerEvents : [];
data.updates = Array.isArray(data.updates) ? data.updates : [];

if (now < startAt) { console.log("Story graph growth has not started yet."); process.exit(0); }
if (data.updates.some((update) => update.hourKey === hourKey)) { console.log("This Taipei hour has already been applied."); process.exit(0); }
if (data.final) { console.log("The final graph state is already active."); process.exit(0); }

if (now >= finalAt) {
  data.final = true;
  data.finalActivatedAt = now.toISOString();
  data.releasedDepth = Math.max(data.releasedDepth, 8);
  data.updates.push({ hourKey, releaseAt, type: "final", message: "Final nodes are now reachable from every coherent path after depth 8." });
  data.generatedAt = now.toISOString();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log("Activated the final branching endings.");
  process.exit(0);
}

const seed = hash(hourKey);
const nextDepth = data.releasedDepth + 1;
const event = { depth: nextDepth, hourKey, releaseAt, motif: pick(motifs, seed), distortion: pick(distortions, seed, 1), whisper: pick(whispers, seed, 2) };
data.releasedDepth = nextDepth;
data.layerEvents.push(event);
data.updates.push({ hourKey, releaseAt, type: "depth", releasedDepth: nextDepth });
data.layerEvents = data.layerEvents.slice(-520);
data.updates = data.updates.slice(-520);
data.generatedAt = now.toISOString();
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Released story depth ${nextDepth} with three choices per node.`);
