import fs from "node:fs";
import path from "node:path";

const outputPath = path.join(process.cwd(), "public", "story.generated.json");
const startAt = new Date("2026-07-14T16:00:00+08:00");
const finalAt = new Date("2026-07-31T23:00:00+08:00");
const now = process.env.STORY_NOW ? new Date(process.env.STORY_NOW) : new Date();
if (Number.isNaN(now.getTime())) throw new Error(`Invalid STORY_NOW: ${process.env.STORY_NOW}`);

const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23"
}).formatToParts(now).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});

const hourKey = `${parts.year}${parts.month}${parts.day}-${parts.hour}`;
const releaseAt = `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:00`;

function hash(text) {
  let value = 2166136261;
  for (const char of String(text)) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value >>> 0);
}
function pick(list, seed, offset = 0) {
  return list[(seed + offset * 7919) % list.length];
}

const sceneBeats = [
  "門縫下的藍光忽然被一顆頭擋住。",
  "白霧在玻璃上寫出你的名字。",
  "水管敲了三下，腳邊螺絲跟著跳動。",
  "所有反光同時漏掉同一件東西。",
  "感應燈一盞盞朝你亮來。",
  "地板多出一枚仍在滴水的鞋印。",
  "門把結霜，浮出和你相同的掌紋。",
  "角落影子正在做你沒選的動作。",
  "附近面板同時亮出數字 03。",
  "相連房間傳來第二次相同通知聲。",
  "牆紙從裡面鼓出五根手指。",
  "玻璃裡的人沒有隨你回頭。"
];

const sensoryDetails = [
  "冷氣鑽進袖口，身後有人咳了一聲。",
  "空氣帶著濕鐵與舊紙味。",
  "耳膜發緊，腳步先在背後響起。",
  "白氣貼著牆往出口爬。",
  "你停下，另一雙鞋也停下。",
  "電器全暗，只剩手機照亮手指。",
  "灰塵被推開，留下半枚腳印。",
  "金屬內側傳來慢慢刮動的指甲聲。",
  "燈一閃，物品同時偏了半公分。",
  "另一道較慢的心跳追上了你。"
];

const dialogues = [
  "別回頭。我就在剛才那裡。",
  "門能打開，不代表能出去。",
  "另一個你已經先到了。",
  "先看鞋，他和你只有那裡不同。",
  "別跑直線，它會照著你的路追。",
  "那不是回憶，它正在補完你的選擇。",
  "別讓它碰到你的手。",
  "有人替你按了第三項。",
  "別讓它知道下一扇門在哪裡。",
  "你不碰的東西，另一個你會碰。"
];

const data = fs.existsSync(outputPath)
  ? JSON.parse(fs.readFileSync(outputPath, "utf8"))
  : {
      schemaVersion: 3,
      generatedAt: null,
      timezone: "Asia/Taipei",
      finalScheduledAt: "2026-07-31T23:00:00+08:00",
      releasedDepth: 6,
      final: false,
      proseStyle: "modern-horror-compact-v2",
      narrativeVersion: 2,
      layerEvents: [],
      updates: []
    };

data.schemaVersion = 3;
data.timezone = "Asia/Taipei";
data.finalScheduledAt = "2026-07-31T23:00:00+08:00";
data.proseStyle = "modern-horror-compact-v2";
data.narrativeVersion = 2;
data.releasedDepth = Number.isInteger(data.releasedDepth) ? data.releasedDepth : 6;
data.layerEvents = Array.isArray(data.layerEvents) ? data.layerEvents : [];
data.updates = Array.isArray(data.updates) ? data.updates : [];

if (now < startAt) {
  console.log("Story graph growth has not started yet.");
  process.exit(0);
}
if (data.updates.some((update) => update.hourKey === hourKey)) {
  console.log("This Taipei hour has already been applied.");
  process.exit(0);
}
if (data.final) {
  console.log("The final graph state is already active.");
  process.exit(0);
}

if (now >= finalAt) {
  data.final = true;
  data.finalActivatedAt = now.toISOString();
  data.releasedDepth = Math.max(data.releasedDepth, 8);
  data.updates.push({ hourKey, releaseAt, type: "final", message: "Final path-specific endings are active." });
  data.generatedAt = now.toISOString();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log("Activated the final branching endings.");
  process.exit(0);
}

const seed = hash(hourKey);
const nextDepth = data.releasedDepth + 1;
const sceneBeat = pick(sceneBeats, seed);
const sensory = pick(sensoryDetails, seed, 1);
const dialogue = pick(dialogues, seed, 2);
const event = {
  depth: nextDepth,
  hourKey,
  releaseAt,
  formatVersion: 2,
  motif: sceneBeat,
  distortion: sensory,
  whisper: dialogue,
  sceneBeat,
  sensory,
  dialogue
};

data.releasedDepth = nextDepth;
data.layerEvents.push(event);
data.updates.push({ hourKey, releaseAt, type: "depth", releasedDepth: nextDepth });
data.layerEvents = data.layerEvents.slice(-520);
data.updates = data.updates.slice(-520);
data.generatedAt = now.toISOString();
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Released story depth ${nextDepth} in compact horror style.`);
