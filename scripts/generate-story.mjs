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
  "門縫下滲進一道淡藍色的光。你把手機貼近地面，鏡頭裡只拍到一雙蹲在門外的膝蓋。",
  "玻璃表面蒙上一層白霧。霧裡有人從另一側寫下你的名字，最後一筆還沒乾。",
  "水管裡傳來三下敲擊。第三下落下時，你腳邊的螺絲跟著跳了一下。",
  "所有能反光的地方同時少映出一件東西。你回頭確認，那件東西仍在原位。",
  "遠處的感應燈一盞接一盞亮起。燈光沒有離開，反而沿著走廊一路朝你靠近。",
  "你聞到雨水泡過鐵門的味道。下一秒，地板上多出一枚還在滴水的鞋印。",
  "門把表面迅速結霜。白霜裡浮出一組剛離開的指印，掌紋和你完全相同。",
  "角落那小塊陰影沒有跟著手電筒移動。影子裡的人正在做你上一幕沒有選的動作。",
  "手機、電梯和洗衣機面板同時亮出數字 03。你還沒碰按鈕，第三個選項已先變紅。",
  "你的手機響了一聲。兩秒後，相連的下一個空間裡又響起完全相同的通知音。",
  "牆紙從裡面鼓起一個手掌大小的形狀。五根手指慢慢分開，像在找能撕開的位置。",
  "防火門的玻璃映出一個站在你背後的人。你回頭時，玻璃裡的他仍然沒有消失。"
];

const sensoryDetails = [
  "冷氣沿著手腕鑽進袖口，身後有人很輕地咳了一聲。",
  "空氣裡有潮濕鐵鏽和舊紙張的味道，舌根泛起淡淡苦味。",
  "耳膜像搭電梯時一樣往內壓，遠處腳步反而先在你身後響起。",
  "你呼出的白氣沒有散開，而是貼著牆面往出口方向爬。",
  "鞋底摩擦聲總比你慢一步；你停，它也跟著停。",
  "附近電器的指示燈一起熄滅，只剩手機螢幕照亮你的手。",
  "地面灰塵被看不見的鞋底推開，留下半枚尚未完成的腳印。",
  "金屬表面傳來細小震動，像有人在另一側用指甲慢慢刮。",
  "燈光閃過時，附近每件物品都向同一方向偏了半公分。",
  "你聽見自己的心跳被另一道較慢的心跳追上，兩者短暫重疊。"
];

const dialogues = [
  "別急著回頭。我就在你剛才看過的地方。",
  "門可以打開，不代表外面是讓你出去的地方。",
  "另一個你走得比較快。他已經看見下一層了。",
  "先看他的鞋。你和他只有那裡不一樣。",
  "別跑直線。它只會沿著你走過的路追。",
  "那不是回憶。它正在替你把沒做的事補完。",
  "我不是叫你別開門。我是叫你別讓它碰到你的手。",
  "有人在另一條路替你按了第三個選項。",
  "它看得懂你的眼神。別讓它知道下一扇門在哪裡。",
  "你不碰的東西，另一個你會替你碰。"
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
      proseStyle: "modern-horror-novel",
      layerEvents: [],
      updates: []
    };

data.schemaVersion = 3;
data.timezone = "Asia/Taipei";
data.finalScheduledAt = "2026-07-31T23:00:00+08:00";
data.proseStyle = "modern-horror-novel";
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
console.log(`Released story depth ${nextDepth} in modern horror novel style.`);
