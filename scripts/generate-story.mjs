import fs from "node:fs";
import path from "node:path";

const outputPath = path.join(process.cwd(), "public", "story.generated.json");
const startAt = new Date("2026-07-14T16:00:00+08:00");
const finalAt = new Date("2026-07-31T23:00:00+08:00");
const now = new Date(process.env.STORY_NOW || Date.now());

const pad = (value) => String(value).padStart(2, "0");
const taipeiParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23"
}).formatToParts(now).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});

const hourKey = `${taipeiParts.year}${taipeiParts.month}${taipeiParts.day}-${taipeiParts.hour}`;
const releaseAt = `${taipeiParts.year}-${taipeiParts.month}-${taipeiParts.day} ${taipeiParts.hour}:00`;
const isFinalHour = now >= finalAt;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const data = fs.existsSync(outputPath)
  ? JSON.parse(fs.readFileSync(outputPath, "utf8"))
  : { generatedAt: null, episodes: [] };

data.episodes = Array.isArray(data.episodes) ? data.episodes : [];

if (now < startAt) {
  console.log("Story generation has not started yet.");
  process.exit(0);
}

if (data.episodes.some((episode) => episode.id === `live-${hourKey}` || episode.id === "final-20260731")) {
  console.log("This hour already exists.");
  process.exit(0);
}

function hash(text) {
  let value = 2166136261;
  for (const char of text) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value >>> 0);
}

function pick(list, seed, offset = 0) {
  return list[(seed + offset * 7919) % list.length];
}

function makeFinalEpisode() {
  return {
    id: "final-20260731",
    releaseAt,
    isFinal: true,
    title: "最終夜：它終於說出自己在哪裡",
    subtitle: "7 月 31 日，故事停止更新。回聲必須選擇留下的方式。",
    scene: "clock",
    accent: "red",
    intro: "23:00 的整點到來後，網站沒有新增下一章。取而代之的是一行緩慢出現的字：『我不在床下、門外、牆裡，也不在你的螢幕後方。那些地方只是我用來讓你注意的比喻。』房間裡所有細微聲音同時停止。最後一句出現：『我一直在你每次做出選擇後，沒有成為的那個人裡。現在請決定，要把我留在哪裡。』",
    routeText: {
      nerve: "你已經習慣迎向恐懼。它知道自己無法再用後退逼你前進。",
      insight: "你看見完整規則：回聲由所有未選分支構成，Cookie 只是它用來記住入口的索引。",
      empathy: "你一路聽見的並不是威脅，而是無數未被選擇的自己要求被承認。",
      balanced: "你從未讓它完全預測成功，因此仍保有不屬於任何既定結局的可能。"
    },
    choices: [
      {
        label: "刪除所有紀錄，讓未選的自己一起消失",
        icon: "✕",
        ending: "silence",
        result: "你清空紀錄。頁面變成純黑，呼吸、敲擊與回聲全部消失。幾分鐘後，你開始想不起自己為何打開這個網站。只有一種莫名的輕鬆，以及一個永遠無法確認是否失去過誰的空位。——結局：寂靜是最乾淨的房間。",
        effects: { nerve: 3, insight: 0, empathy: -2 },
        flag: "ending_silence"
      },
      {
        label: "保留 Cookie，將所有分支封存在這個網站",
        icon: "▣",
        ending: "archive",
        result: "你讓網站成為容器。從此它不再侵入房間，只在你重新開啟頁面時醒來。你知道每個按鈕後都擠著無數個未被選到的自己，但至少它們有了一個可以被看見的地方。——結局：回聲檔案館。",
        effects: { nerve: 0, insight: 3, empathy: 0 },
        item: "封存的所有分支"
      },
      {
        label: "承認那些分支也是你，讓回聲留在記憶裡",
        icon: "◇",
        ending: "acceptance",
        result: "你不再要求回聲證明自己來自哪裡。房間恢復原本的聲音，但從此每次面臨選擇，你都能短暫感到另外兩條人生在身旁呼吸。它們沒有奪走你，只提醒你：成為某個人，必然也意味著放棄許多自己。——結局：與未選之人共存。",
        effects: { nerve: 0, insight: 0, empathy: 3 },
        flag: "ending_acceptance"
      }
    ]
  };
}

function makeHourlyEpisode() {
  const seed = hash(hourKey);
  const places = [
    ["洗手台下方", "水管沒有漏水，滴答聲卻正好比你的心跳慢半拍", "sink"],
    ["未完全闔上的抽屜", "裡面傳來紙張被慢慢翻面的聲音", "drawer"],
    ["天花板與牆交界的陰影", "它每次在你眨眼後多出一個轉角", "ceiling"],
    ["關機的電視螢幕", "倒影比現實多亮著一盞燈", "screen"],
    ["門把內側", "金屬表面留著從房內握住的指紋", "door"],
    ["窗簾與牆之間", "沒有風，布料卻像有人正在裡面換氣", "curtain"],
    ["充電線纏繞的地方", "線圈正以非常緩慢的速度自行收緊", "cable"],
    ["你剛離開過的座位", "坐墊凹陷尚未恢復，旁邊卻多出第二個凹痕", "chair"],
    ["鏡子邊緣看不清的區域", "那裡的動作永遠比你早一瞬間", "mirror"],
    ["安靜太久的走廊", "遠處感應燈正在一盞盞朝你的方向亮起", "hall"]
  ];
  const messages = [
    "網站出現一行你沒有輸入的字：『這次不要選最快的。』",
    "你的選擇序列被敲擊聲完整重播，最後多了一個尚未做出的數字。",
    "插畫角落的人影抬手指向現實中的某個方向，然後迅速放下。",
    "頁面顯示的本地時間短暫比真正時間快一分鐘，並標記為『已發生』。",
    "你聽見熟悉的通知聲，但它來自一個不可能放置手機的位置。",
    "所有文字同時向左偏移一個字寬，像在替看不見的讀者騰出位置。",
    "環境音裡混入一句極低的人聲：『他又走到這裡了。』",
    "畫面亮度自動降低，黑色倒影中有東西正練習你的表情。"
  ];
  const intruders = ["另一個做過相反選擇的你", "從未被叫出名字的人", "只在頁面失焦時移動的輪廓", "替你承受錯誤結果的回聲", "比更新早一小時抵達的訪客", "記住所有重啟次數的孩子", "沒有被 Cookie 保存的第四個選項", "一直躲在句號後面的讀者"];
  const place = pick(places, seed);
  const message = pick(messages, seed, 1);
  const intruder = pick(intruders, seed, 2);
  const accents = ["red", "amber", "blue", "violet", "green"];
  const scenes = ["room", "door", "photo", "phone", "screen", "wall", "hall", "clock"];
  const count = data.episodes.length + 1;

  return {
    id: `live-${hourKey}`,
    releaseAt,
    title: `整點回聲 ${pad(count)}：${place[0]}正在記住你`,
    subtitle: `${place[1]}。`,
    scene: pick(scenes, seed, 3),
    accent: pick(accents, seed, 4),
    intro: `現在是 {{time}}。你注意到${place[0]}有些不對勁：${place[1]}。${message} 當你試圖確認時，${intruder}似乎已經知道你會先看哪裡。`,
    routeText: {
      nerve: `你沒有退開。${intruder}因此改變姿勢，像第一次遇到不配合劇本的人。`,
      insight: `你發現異常出現的間隔與第 ${count} 次整點更新一致；規則仍存在，只是正在學習隱藏。`,
      empathy: `你從聲音裡聽出疲憊。${intruder}不是剛來，而是已經等了你很多個沒有被保存的小時。`,
      balanced: "你的三種傾向仍然接近，讓這一幕無法提前決定要用恐嚇、謎題或求救接近你。"
    },
    choices: [
      {
        label: `立刻接近${place[0]}，在它完成變化前阻止它`,
        icon: "→",
        result: `你先一步碰到異常。${place[0]}恢復正常，但你的影子慢了半秒才跟上。那半秒裡，它做了一個你沒有做的手勢。`,
        effects: { nerve: 2, insight: 0, empathy: -1 },
        flag: `hour_${hourKey}_confronted`
      },
      {
        label: "保持距離，記錄聲音、光線與時間的變化",
        icon: "⌘",
        result: `你找到規律：每當你準備做出與過往相同的選擇，異常就會靠近；當你猶豫，它反而停下。你獲得一份能干擾預測的「不一致紀錄」。`,
        effects: { nerve: 0, insight: 2, empathy: 0 },
        item: `不一致紀錄 ${hourKey}`
      },
      {
        label: `不追問來源，先對${intruder}說「我知道你在」`,
        icon: "◇",
        result: `異常沒有消失，卻第一次主動退遠。${place[0]}留下一小段溫度，以及一句幾乎聽不見的回答：『被注意到和被放進來，不是同一件事。』`,
        effects: { nerve: 0, insight: 0, empathy: 2 },
        flag: `hour_${hourKey}_acknowledged`
      }
    ]
  };
}

const episode = isFinalHour ? makeFinalEpisode() : makeHourlyEpisode();
data.episodes.push(episode);
data.generatedAt = now.toISOString();
data.timezone = "Asia/Taipei";
data.finalScheduledAt = "2026-07-31T23:00:00+08:00";
fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Added ${episode.id}`);
