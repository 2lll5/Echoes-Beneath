"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const COOKIE = "echoes_beneath_state";
const LOOPS = "echoes_beneath_loops";
const WORLD_FALLBACK = {
  schemaVersion: 3,
  releasedDepth: 10,
  final: false,
  layerEvents: []
};

const PLACES = {
  desk: { label: "房間的書桌前", short: "書桌", scene: "screen", anchors: ["關機螢幕", "桌面倒影", "椅背後方"], exits: ["door", "wall"] },
  door: { label: "房門內側", short: "房門", scene: "door", anchors: ["門縫下的光", "冰冷門把", "窺視孔"], exits: ["desk", "hall"] },
  wall: { label: "床頭旁的牆面", short: "牆邊", scene: "wall", anchors: ["牆內管線", "鬆動插座", "牆紙接縫"], exits: ["desk", "utility"] },
  hall: { label: "住處外的狹長走廊", short: "走廊", scene: "hall", anchors: ["感應燈", "沒有號碼的鄰門", "監視器"], exits: ["door", "stairs", "elevator"] },
  stairs: { label: "逃生梯轉角", short: "樓梯間", scene: "stairs", anchors: ["向下扶手", "半層平台", "防火門玻璃"], exits: ["hall", "lobby", "roof"] },
  elevator: { label: "電梯前的小廳", short: "電梯廳", scene: "elevator", anchors: ["永遠差一層的樓層燈", "不同步的電梯門", "緊急按鈕"], exits: ["hall", "laundry", "lobby"] },
  laundry: { label: "共用洗衣間", short: "洗衣間", scene: "laundry", anchors: ["未插電的洗衣機", "排水孔", "曬衣桿末端"], exits: ["elevator", "utility"] },
  utility: { label: "牆後維修空間", short: "維修夾層", scene: "pipes", anchors: ["溫熱水管", "纏結電線", "狹窄孔洞"], exits: ["wall", "laundry", "stairs"] },
  lobby: { label: "一樓無人的大廳", short: "一樓大廳", scene: "lobby", anchors: ["反鎖玻璃門", "住戶信箱", "停止轉動的監視器"], exits: ["stairs", "elevator", "street"] },
  roof: { label: "沒有其他出口的屋頂", short: "屋頂", scene: "roof", anchors: ["水塔背面", "唯一熄滅的窗", "剪斷的避雷線"], exits: ["stairs"] },
  street: { label: "大樓門口的騎樓", short: "騎樓", scene: "street", anchors: ["無車路口", "映不出你的玻璃", "閃爍招牌"], exits: ["lobby"] }
};

const THREATS = {
  reflection: {
    label: "倒影先行",
    entity: "比你早一拍的倒影",
    actions: [
      "玻璃裡的你先抬起頭，現實中的頸背過了兩秒才跟著發緊。",
      "反光裡那張臉慢慢轉向出口，眼睛卻一直盯著你。",
      "倒影把手掌貼在玻璃上，五根手指的位置正好避開你自己的手。"
    ]
  },
  threshold: {
    label: "門檻來客",
    entity: "始終站在另一側的人",
    actions: [
      "門外有人換了一次重心，鞋底在地面拖出很短的一聲。",
      "門把被壓下半公分，又像有人突然想起你正握著另一端似地停住。",
      "你看不見人，只看見門縫下那雙腳往旁邊挪了一步。"
    ]
  },
  voice: {
    label: "牆後回聲",
    entity: "借用熟悉聲音的回聲",
    actions: [
      "牆裡傳來你的聲音，先清了清喉嚨，才說出你還沒開口的那句話。",
      "水管裡的呼吸靠得很近，像有人把嘴貼在金屬另一側。",
      "那個聲音叫了你的名字，語氣和你母親提醒你關瓦斯時一模一樣。"
    ]
  },
  duplicate: {
    label: "未選之人",
    entity: "做了另一個選擇的你",
    actions: [
      "轉角閃過一件和你身上相同的衣服，衣角還沾著你沒去過地方的灰。",
      "另一串腳步和你同時停下，只是聲音來自相反方向。",
      "那個輪廓手裡拿著一件你差點得到的東西，遠遠朝你晃了一下。"
    ]
  },
  erased: {
    label: "被刪掉的位置",
    entity: "沒有被記錄的第四個選項",
    actions: [
      "三個選項之間的空白像被手指從螢幕背面頂起，鼓成一小塊。",
      "旁邊的椅子自己退開，像在替看不見的人留位子。",
      "你明明記得剛才還有第四行字，卻只剩下游標停在不存在的位置。"
    ]
  }
};

const THREAT_KEYS = Object.keys(THREATS);
const STATS = { nerve: ["◆", "鎮定"], insight: ["◇", "警覺"], empathy: ["◌", "共感"] };
const ROOT_CONTEXT = { place: "desk", from: null, threat: "reflection", relation: "unknown", pressure: 0, carry: "網站剛剛自行亮起。" };

const freshState = () => ({
  version: 3,
  node: "root",
  depth: 0,
  context: { ...ROOT_CONTEXT },
  history: [],
  stats: { nerve: 0, insight: 0, empathy: 0 },
  flags: [],
  items: [],
  result: null,
  pending: null,
  ending: null
});

const hash = (text) => {
  let value = 2166136261;
  for (const char of String(text)) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value >>> 0);
};
const pick = (list, seed, offset = 0) => list[(seed + offset * 7919) % list.length];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const place = (context) => PLACES[context?.place] || PLACES.desk;
const threat = (context) => THREATS[context?.threat] || THREATS.reflection;
const nextThreat = (current, offset) => THREAT_KEYS[(THREAT_KEYS.indexOf(current) + offset + THREAT_KEYS.length) % THREAT_KEYS.length];
const route = (stats) => {
  const entries = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  return entries[0][1] === entries[1][1] ? "balanced" : entries[0][0];
};
const routeName = (key) => ({ nerve: "不回頭的人", insight: "看見細節的人", empathy: "願意聽完的人", balanced: "還沒被摸透的人" }[key]);
const allowed = (from, to) => from && to && (from.place === to.place || PLACES[from.place]?.exits.includes(to.place));
const unlocked = (depth, world) => world.final || depth <= Number(world.releasedDepth || 0);
const branchCount = (depth) => depth < 13 ? (3 ** depth).toLocaleString("zh-TW") : `約 10^${(depth * Math.log10(3)).toFixed(1)}`;
const timeText = (date = new Date()) => new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
const personalized = (text, date) => String(text || "").replaceAll("{{time}}", timeText(date));
const cleanDialogue = (text) => String(text || "").replace(/^[「『“\"]+|[」』”\"]+$/g, "");

function rootNode() {
  return {
    id: "root",
    title: "第一刻：房間裡多了一個呼吸",
    subtitle: "凌晨的房間很安靜，安靜到你能分辨哪一道呼吸不是自己的。",
    scene: "screen",
    accent: "red",
    context: ROOT_CONTEXT,
    paragraphs: [
      "現在是 {{time}}。你剛把手從滑鼠上移開，螢幕就在沒有碰到電源鍵的情況下亮了起來。畫面上沒有登入頁，也沒有網址，只有一行正在閃爍的字：『請選擇你聽見聲音的位置。』",
      "喇叭是靜音的。你仍然聽見一段很輕的呼吸，斷斷續續，像隔著玻璃、門板或牆面。你試著屏住氣，房間立刻安靜了一秒。接著，那道呼吸又多吸了一口。",
      "椅背後方傳來布料摩擦聲。你沒有回頭。螢幕黑色邊框裡的倒影卻先轉過了頭。"
    ],
    reactions: {
      nerve: "你摸到桌上的美工刀，刀片還沒推出來，椅背後的聲音就停了。",
      insight: "你發現游標停在哪個選項上，呼吸就會從那個方向靠近一點。",
      empathy: "那道呼吸不只急，還帶著壓抑哭聲時才有的顫抖。",
      balanced: "你既沒有靠近，也沒有退後。螢幕上的字閃了兩次，像在等你露出習慣。"
    },
    choices: [
      {
        id: "reflection",
        label: "不回頭，借關機螢幕看清身後",
        icon: "◉",
        result: "你把螢幕角度壓低。倒影裡的你已經站了起來，臉貼在玻璃另一側；現實中的你還坐在椅子上。它抬起手，在玻璃上寫下『別看門』。",
        delta: { nerve: 1, insight: 2, empathy: 0 },
        flag: "root_reflection",
        next: "branch-reflection",
        context: { place: "desk", from: "desk", threat: "reflection", relation: "watching", pressure: 1, carry: "你留在書桌前。倒影在玻璃上留下了『別看門』四個字。" }
      },
      {
        id: "threshold",
        label: "關掉桌燈，退到房門旁確認外面的人",
        icon: "▯",
        result: "桌燈熄掉後，門縫下的光反而更亮。你退到門邊，看見外面站著一雙赤腳。那雙腳沒有影子，腳尖正慢慢轉向房間。",
        delta: { nerve: 2, insight: 0, empathy: -1 },
        flag: "root_threshold",
        next: "branch-threshold",
        context: { place: "door", from: "desk", threat: "threshold", relation: "hostile", pressure: 2, carry: "你離開書桌來到房門內側。門外有一雙沒有影子的赤腳。" }
      },
      {
        id: "voice",
        label: "走到床頭，把耳朵貼上傳出呼吸的牆",
        icon: "◌",
        result: "你的耳朵剛碰到牆紙，呼吸便停了。牆後有人用你的聲音貼著耳邊說：『終於選到我了。』說完後，它在牆裡敲了三下。",
        delta: { nerve: 0, insight: 1, empathy: 2 },
        item: "牆後的第一句話",
        next: "branch-voice",
        context: { place: "wall", from: "desk", threat: "voice", relation: "curious", pressure: 1, carry: "你離開書桌來到床頭牆邊。牆後的聲音用你的嗓音說了第一句話。" }
      }
    ]
  };
}

function dynamicNode(state, world) {
  const ctx = state.context;
  const here = place(ctx);
  const danger = threat(ctx);
  const event = world.layerEvents?.find((item) => item.depth === state.depth) || {
    hourKey: `fallback-${state.depth}`,
    sceneBeat: "頭頂的燈閃了一下，地上多出一道不屬於你的影子。",
    sensory: "空氣裡有潮濕鐵鏽味。",
    dialogue: "你終於走到我看得見的地方了。"
  };
  const seed = hash(`${state.node}:${state.depth}:${event.hourKey}`);
  const anchor = pick(here.anchors, seed);
  const moveId = pick(here.exits, seed, 1);
  const remaining = here.exits.filter((id) => id !== moveId);
  const otherId = pick(remaining.length ? remaining : here.exits, seed, 2);
  const nextDepth = state.depth + 1;
  const weave = nextDepth % 4 === 0;
  const inspectThreat = nextThreat(ctx.threat, 1 + seed % 2);
  const moveThreat = nextThreat(ctx.threat, 2);
  const talkThreat = nextThreat(ctx.threat, 3 + seed % 2);
  const pressure = clamp(Number(ctx.pressure || 0), 0, 9);
  const sceneBeat = event.sceneBeat || event.motif || "頭頂的燈閃了一下。";
  const sensory = event.sensory || event.distortion || "空氣突然冷了一點。";
  const dialogue = cleanDialogue(event.dialogue || event.whisper || "別急著回頭。");
  const threatAction = pick(danger.actions, seed, 3);

  const inspectCtx = {
    place: ctx.place,
    from: ctx.place,
    threat: inspectThreat,
    relation: ctx.relation === "hostile" ? "measuring" : "watching",
    pressure: clamp(pressure + 1, 0, 9),
    carry: `你留在${here.short}，親手碰過${anchor}。表面留下了一道新鮮刮痕。`
  };
  const moveCtx = {
    place: moveId,
    from: ctx.place,
    threat: moveThreat,
    relation: pressure >= 5 ? "pursuing" : ctx.relation,
    pressure: clamp(pressure + 1, 0, 9),
    carry: `你從${here.short}沿著眼前唯一可走的通道來到${PLACES[moveId].short}。身後的腳步一路跟到門口。`
  };
  const talkPlace = weave ? otherId : ctx.place;
  const talkCtx = {
    place: talkPlace,
    from: ctx.place,
    threat: talkThreat,
    relation: ctx.relation === "hostile" ? "uncertain" : "recognized",
    pressure: clamp(pressure + (ctx.relation === "hostile" ? 0 : -1), 0, 9),
    carry: weave
      ? `你循著聲音穿過通往${PLACES[talkPlace].short}的出口。那裡已有一串方向相反的濕腳印。`
      : `你留在${here.short}，逼牆後的聲音回答只有眼前才能確認的問題。`
  };

  const key = (action, target, joined = false) => joined
    ? `weave-${hash(`${target.place}:${target.threat}:${Math.floor(nextDepth / 4)}`).toString(36)}`
    : `node-${hash(`${state.node}:${action}:${target.place}:${target.threat}:${nextDepth}`).toString(36)}`;

  const arrival = ctx.from && ctx.from !== ctx.place
    ? `你從${PLACES[ctx.from]?.short || "上一處"}過來，鞋底還帶著那裡的灰。${here.label}比剛才更冷，呼出的氣在眼前停了一瞬。`
    : `你仍站在${here.label}。剛才碰過的東西都還在原位，只有${anchor}向旁邊偏了幾公分。`;

  return {
    id: state.node,
    title: `第 ${String(state.depth + 1).padStart(2, "0")} 刻：${anchor}動過了`,
    subtitle: `你沒有跳到別的地方。這一幕就發生在${here.short}。`,
    scene: here.scene,
    accent: ["red", "amber", "blue", "violet", "green"][seed % 5],
    context: ctx,
    paragraphs: [
      `${arrival}${ctx.carry ? ` ${ctx.carry}` : ""}`,
      `${sceneBeat}${sensory ? ` ${sensory}` : ""} ${threatAction}`,
      `${danger.entity}沒有露面。它只在離你最近的表面後方說：「${dialogue}」`
    ],
    reactions: {
      nerve: `你握緊手邊能當武器的東西，往前一步。${danger.entity}沒有再靠近，反而往視線死角退了半步。`,
      insight: `你低頭看地面。灰塵、鞋印和門的開合方向都對得上；它沒有能力把你直接丟到另一個房間。`,
      empathy: `那句話說完後，牆後傳來很輕的吞嚥聲。它像是在害怕你不會回答。`,
      balanced: `你沒有立刻表態，只把手機鏡頭對準${anchor}。對方安靜下來，像在重新判斷你。`
    },
    choices: [
      {
        id: "inspect",
        label: `留在${here.short}，把${anchor}翻開來看`,
        icon: "◎",
        result: `你蹲下來，用指節敲了敲${anchor}。第二下還是實心，第三下卻從裡面傳回來。你沿著邊緣摸到一道剛出現的刮痕，刮痕末端像一個朝內指的箭頭。`,
        delta: { nerve: 1, insight: 2, empathy: 0 },
        flag: `inspect_${ctx.place}_${state.depth}`,
        next: key("inspect", inspectCtx),
        context: inspectCtx
      },
      {
        id: "move",
        label: `沿著眼前的出口前往${PLACES[moveId].short}`,
        icon: "→",
        result: `你先把手機伸過出口照了一圈，確認另一側確實是${PLACES[moveId].label}，才側身通過。門在你背後慢慢闔上時，另一雙腳步也跨過了門檻。`,
        delta: { nerve: 2, insight: 0, empathy: -1 },
        flag: `move_${ctx.place}_${moveId}`,
        next: key("move", moveCtx),
        context: moveCtx
      },
      {
        id: "interact",
        label: weave ? `順著回答走到${PLACES[otherId].short}` : `留在${here.short}，逼它說出眼前的細節`,
        icon: "◇",
        result: weave
          ? `你跟著聲音穿過通往${PLACES[otherId].label}的出口。地上有一串濕腳印從另一個方向抵達，停在和你相同的位置。腳印的主人不在，但其中一枚鞋印裡卡著你曾經錯過的線索。`
          : `你問它${anchor}現在朝哪一邊。牆後沉默了很久，才準確說出表面的裂痕和你剛才留下的指印。它確實一直在這裡看著。`,
        delta: { nerve: 0, insight: 1, empathy: 2 },
        item: weave ? `沾水的陌生鞋印 ${talkPlace}-${Math.floor(nextDepth / 4)}` : `對方說出的現場細節 ${state.depth}`,
        next: key("interact", talkCtx, weave),
        context: talkCtx
      }
    ]
  };
}

function finalNode(state) {
  const here = place(state.context);
  const danger = threat(state.context);
  return {
    id: `final-${state.node}`,
    final: true,
    title: `最終刻：${here.short}裡只剩下你和它`,
    subtitle: `你走過 ${state.history.length} 次選擇，每一扇門都還記得你從哪裡來。`,
    scene: here.scene,
    accent: "red",
    context: state.context,
    paragraphs: [
      `7 月 31 日晚上十一點，${here.label}的燈全部熄滅。手機還有電，畫面卻只剩下一張照片：你站在現在的位置，背後擠滿了做過其他選擇的自己。`,
      `${danger.entity}終於走到你看得見的地方。它的臉和你一樣，只是比你疲倦很多。它把一路跟來的線索放在地上，一件也沒有多，一件也沒有少。`,
      `「我不能取代你，」它說，「但你得決定，那些沒有被選到的人要去哪裡。」`
    ],
    reactions: {
      nerve: "你知道只要封死入口，今晚就能結束；代價是再也沒有人知道門後發生過什麼。",
      insight: "你把所有門、腳印和時間記在紙上，第一次看見它們能拼成一條完整路線。",
      empathy: "那些聲音不是想搶走你的位置，只是不想在沒被選擇後立刻消失。",
      balanced: "你沒有急著原諒，也沒有立刻驅逐。你要求它們先把名字一個個說出來。"
    },
    choices: [
      {
        id: "sever",
        label: `封死${here.short}的入口，讓它們留在門後`,
        icon: "✕",
        ending: "severed",
        result: `你把最後一道門鎖上，再用家具抵住。門後先是有人拍打，接著有人用你的聲音喊名字，最後只剩很輕的呼吸。天亮後，大樓恢復正常。只有你知道，牆裡還住著所有沒被選到的人。——結局：門後的人。`,
        delta: { nerve: 3, insight: 0, empathy: -2 },
        flag: "ending_severed"
      },
      {
        id: "map",
        label: "把所有路畫下來，替每個人留下能回去的門",
        icon: "⌘",
        ending: "mapped",
        result: "你用整晚畫出每一條走過的樓梯、走廊和房間。當最後一條線接上時，散落在各處的腳步聲開始一個個離開。它們沒有消失，只是回到屬於自己的那一晚。——結局：回去的地圖。",
        delta: { nerve: 0, insight: 3, empathy: 0 },
        item: "完整故事圖"
      },
      {
        id: "coexist",
        label: `讓${danger.entity}留下，但訂下不能越過的界線`,
        icon: "◇",
        ending: "coexist",
        result: `你在地上畫出一道線，要求它不能碰你的門、不能替你做選擇，也不能用親人的聲音騙你。它沉默很久，最後退到線外坐下。從那天起，你偶爾會在反光裡看見另一個自己，但它只會提醒你忘了關燈。——結局：線外的室友。`,
        delta: { nerve: 0, insight: 0, empathy: 3 },
        flag: "ending_coexist"
      }
    ]
  };
}

const nodeFor = (state, world) => state.node === "root" ? rootNode() : world.final && state.depth >= 8 ? finalNode(state) : dynamicNode(state, world);
const readCookie = (name) => {
  const row = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.split("=").slice(1).join("=")) : null;
};
const writeCookie = (name, value) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${new Date(Date.now() + 15552000000).toUTCString()}; path=/; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
};
const encode = (value) => {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(value)))); } catch { return ""; }
};
const decode = (value) => {
  try { return JSON.parse(decodeURIComponent(escape(atob(value)))); } catch { return null; }
};
const normalize = (value) => value?.version === 3 && value.context && Number.isInteger(value.depth)
  ? {
      ...freshState(),
      ...value,
      stats: { ...freshState().stats, ...(value.stats || {}) },
      history: Array.isArray(value.history) ? value.history.slice(-100) : [],
      flags: Array.isArray(value.flags) ? value.flags.slice(-100) : [],
      items: Array.isArray(value.items) ? value.items.slice(-60) : []
    }
  : freshState();

function Scene({ node, clicks, inspect }) {
  const here = place(node.context);
  const danger = node.context?.threat || "reflection";
  const palette = {
    red: ["#ff4b55", "#3c080d"],
    amber: ["#ffb03b", "#3c2106"],
    blue: ["#63b3ff", "#071f3c"],
    violet: ["#b58cff", "#24103f"],
    green: ["#75e5a1", "#0b3420"]
  }[node.accent] || ["#ff4b55", "#3c080d"];
  const seed = hash(node.id);

  return (
    <button className="art-button" onClick={inspect} aria-label="調查場景異常">
      <svg className="scene-art" viewBox="0 0 1000 600">
        <defs>
          <linearGradient id={`b-${node.id}`} x2="1" y2="1">
            <stop stopColor="#020304" />
            <stop offset=".66" stopColor="#090b0f" />
            <stop offset="1" stopColor={palette[1]} />
          </linearGradient>
        </defs>
        <rect width="1000" height="600" fill={`url(#b-${node.id})`} />
        {Array.from({ length: 26 }, (_, index) => (
          <circle key={index} cx={seed * (index + 13) * 17 % 1000} cy={seed * (index + 7) * 29 % 600} r={index % 6 ? 1 : 2} fill="#fff" opacity=".08" />
        ))}
        <path d="M80 560L230 105H770L920 560Z" fill="#050608" stroke="#24292e" strokeWidth="4" />
        {(here.scene === "screen" || here.scene === "lobby") && <g><rect x="300" y="140" width="400" height="280" fill="#020304" stroke="#3a4047" strokeWidth="9" /><rect x="325" y="165" width="350" height="230" fill={palette[1]} /></g>}
        {(here.scene === "door" || here.scene === "hall") && <g><rect x="390" y="125" width="220" height="370" fill="#070707" stroke={palette[0]} strokeWidth="5" /><path d="M420 497H580" stroke="#ffe6ad" strokeWidth="8" /></g>}
        {here.scene === "wall" && <path d="M430 210q70-80 140 0v230q-70 55-140 0z" fill="#020304" stroke={palette[0]} strokeWidth="4" />}
        {here.scene === "stairs" && Array.from({ length: 8 }, (_, index) => <path key={index} d={`M${260 + index * 35} ${510 - index * 38}H${610 + index * 12}`} stroke="#3b4045" strokeWidth="13" />)}
        {here.scene === "elevator" && <g><rect x="330" y="120" width="340" height="400" fill="#08090a" stroke="#4a4f55" strokeWidth="8" /><path d="M500 120V520" stroke="#34393e" strokeWidth="5" /></g>}
        {here.scene === "laundry" && <g><circle cx="410" cy="320" r="105" fill="#070809" stroke="#4a5056" strokeWidth="12" /><circle cx="590" cy="320" r="105" fill="#070809" stroke="#4a5056" strokeWidth="12" /></g>}
        {here.scene === "pipes" && <path d="M220 160H760M280 110V540M710 110V540" stroke="#464b50" strokeWidth="26" />}
        {here.scene === "roof" && <path d="M80 450L250 300 410 390 590 260 760 390 920 280V560H80Z" fill="#030405" />}
        {here.scene === "street" && <path d="M110 470H890M500 120V480" stroke="#373c41" strokeWidth="16" />}
        {danger === "reflection" && <g><circle cx="465" cy="325" r="7" fill={palette[0]} /><circle cx="535" cy="325" r="7" fill={palette[0]} /></g>}
        {danger === "threshold" && <path d="M500 190C430 230 420 390 435 530H565C580 390 570 230 500 190Z" fill="#010203" />}
        {danger === "voice" && <path d="M410 300Q500 220 590 300M390 350Q500 260 610 350" fill="none" stroke={palette[0]} strokeWidth="5" />}
        {danger === "duplicate" && <g><path d="M445 520C445 370 468 250 500 230C532 250 555 370 555 520Z" fill="#010203" /><path d="M555 520C555 390 578 280 610 260C642 280 665 390 665 520Z" fill="#010203" /></g>}
        {danger === "erased" && <rect x="420" y="180" width="160" height="300" fill="#000" stroke={palette[0]} strokeDasharray="12 15" strokeWidth="4" />}
        <ellipse cx="855" cy="92" rx={clicks >= 6 ? 70 : 42} ry={clicks >= 6 ? 28 : 10} fill="#020304" stroke={palette[0]} strokeWidth="3" />
        <circle cx="855" cy="92" r={clicks >= 6 ? 15 : 6} fill={palette[0]} />
        <text x="32" y="48" fill="#fff" opacity=".38" fontSize="17">ECHOES // {node.id.toUpperCase()}</text>
      </svg>
      <span className="art-hint">畫面右上角似乎有東西</span>
    </button>
  );
}

function StoryParagraphs({ paragraphs, now }) {
  return (
    <div className="story-copy">
      {(paragraphs || []).map((paragraph, index) => <p key={index}>{personalized(paragraph, now)}</p>)}
    </div>
  );
}

export default function GameRuntime() {
  const [world, setWorld] = useState(WORLD_FALLBACK);
  const [state, setState] = useState(freshState());
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(new Date());
  const [loops, setLoops] = useState(0);
  const [restartOpen, setRestartOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [clicks, setClicks] = useState(0);
  const [sound, setSound] = useState(false);
  const audio = useRef(null);

  useEffect(() => {
    setState(normalize(decode(readCookie(COOKIE) || "")));
    setLoops(Number(readCookie(LOOPS) || 0));
    fetch(`https://raw.githubusercontent.com/2lll5/Echoes-Beneath/main/public/story.generated.json?t=${Date.now()}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("world unavailable")))
      .then((data) => data?.schemaVersion === 3 && setWorld(data))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => { if (ready) writeCookie(COOKIE, encode(state)); }, [state, ready]);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    let idle;
    const active = () => {
      clearTimeout(idle);
      idle = setTimeout(() => setToast("你停得太久。走廊外有人也跟著停了下來。"), 23000);
    };
    const visibility = () => {
      if (document.hidden) document.title = "你離開了。房間裡的人沒有。";
      else {
        document.title = "Echoes Beneath｜底下的回聲";
        setToast("你回來時，桌上的東西都還在，只是杯子的把手轉向了另一邊。");
      }
    };
    ["mousemove", "keydown", "touchstart", "scroll"].forEach((event) => addEventListener(event, active, { passive: true }));
    document.addEventListener("visibilitychange", visibility);
    active();
    return () => {
      clearTimeout(idle);
      ["mousemove", "keydown", "touchstart", "scroll"].forEach((event) => removeEventListener(event, active));
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 4600); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => () => audio.current?.close(), []);

  const node = useMemo(() => nodeFor(state, world), [state, world]);
  const here = place(state.context);
  const danger = threat(state.context);
  const pathRoute = route(state.stats);
  const canAdvance = state.pending ? unlocked(state.pending.depth, world) : false;
  const progress = Math.min(100, state.depth / Math.max(Number(world.releasedDepth || 1), 1) * 100);

  const choose = (choice) => {
    if (state.result || state.ending) return;
    if (!node.final && !allowed(state.context, choice.context)) return setToast("你找不到那條路。眼前的出口並沒有通往那個地方。");
    const stats = { ...state.stats };
    Object.entries(choice.delta || {}).forEach(([key, value]) => { stats[key] = (stats[key] || 0) + value; });
    const result = personalized(choice.result, now);
    const nextPlace = choice.context ? place(choice.context) : here;
    const entry = { node: state.node, depth: state.depth, location: here.short, choice: choice.label, nextLocation: nextPlace.short };
    setState((old) => ({
      ...old,
      stats,
      flags: choice.flag ? [...new Set([...old.flags, choice.flag])].slice(-100) : old.flags,
      items: choice.item ? [...new Set([...old.items, choice.item])].slice(-60) : old.items,
      history: [...old.history, entry].slice(-100),
      result,
      pending: node.final ? null : { node: choice.next, context: choice.context, depth: old.depth + 1 },
      ending: node.final ? choice.ending : old.ending
    }));
  };

  const advance = () => {
    if (!state.pending || !canAdvance) return;
    setState((old) => ({ ...old, node: old.pending.node, context: old.pending.context, depth: old.pending.depth, result: null, pending: null }));
    setClicks(0);
  };

  const reset = () => {
    const value = loops + 1;
    writeCookie(LOOPS, String(value));
    setLoops(value);
    setState(freshState());
    setClicks(0);
    setRestartOpen(false);
    setToast(value === 3 ? "第三次回到開頭時，螢幕先替你選好了上一輪沒走的那一條。" : "房間恢復成最初的樣子，但牆上的刮痕還在。");
  };

  const inspect = () => {
    const value = clicks + 1;
    setClicks(value);
    if (value === 3) setToast(`那雙眼睛剛才往${here.short}的出口看了一眼。`);
    if (value === 6) {
      setToast("彩蛋：你在畫面角落找到一張標著各樓層的舊消防圖。");
      setState((old) => ({ ...old, items: [...new Set([...old.items, "被折過很多次的消防圖"])] }));
    }
  };

  const toggleSound = async () => {
    if (sound) {
      await audio.current?.close();
      audio.current = null;
      setSound(false);
      return;
    }
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    const master = context.createGain();
    master.gain.value = .025;
    master.connect(context.destination);
    [43, 57, 86].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 2 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 2 ? .16 : .32;
      oscillator.connect(gain).connect(master);
      oscillator.start();
    });
    audio.current = context;
    setSound(true);
    setToast("環境音已開啟。低頻聲裡偶爾混著一雙鞋拖過地面的聲音。");
  };

  if (!ready) return <main className="loading-screen"><div className="loader" /><p>正在確認門後還是不是同一條走廊……</p></main>;

  return (
    <main className="game-shell" onPointerMove={(event) => {
      event.currentTarget.style.setProperty("--mx", ((event.clientX / innerWidth - .5) * 2).toFixed(3));
      event.currentTarget.style.setProperty("--my", ((event.clientY / innerHeight - .5) * 2).toFixed(3));
    }}>
      <div className="noise" />
      <div className="watcher"><i /><i /></div>
      <header className="topbar">
        <div><span className="eyebrow">BRANCHING HORROR NOVEL / COOKIE MEMORY</span><h1>Echoes Beneath <small>底下的回聲</small></h1></div>
        <div className="header-actions">
          <button className="ghost-button" onClick={toggleSound}>{sound ? "關閉環境音" : "開啟環境音"}</button>
          <button className="ghost-button" onClick={() => setArchiveOpen(true)}>分支路徑</button>
          <button className="danger-button" onClick={() => setRestartOpen(true)}>重新開始</button>
        </div>
      </header>
      <section className="presence-strip"><span className="live-dot" /><p>本地時間 <strong>{timeText(now)}</strong> · 目前所在地：<strong>{here.short}</strong></p><span>已釋出深度 {world.releasedDepth} · 7/31 收尾</span></section>
      <section className="progress-wrap"><div className="progress-meta"><span>故事深度 {state.depth} / {world.releasedDepth} · 理論路徑 {branchCount(world.releasedDepth)}</span><span>{routeName(pathRoute)} · {danger.label}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></section>

      {state.ending ? (
        <section className="ending-card"><span className="eyebrow">THE END REMEMBERS EVERY DOOR</span><h2>{here.short}終於安靜下來</h2><p>{state.result}</p><p className="ending-code">結局：{state.ending} · 經過 {state.history.length} 個節點</p><button className="danger-button solid" onClick={() => setRestartOpen(true)}>回到第一個夜晚</button></section>
      ) : (
        <div className="game-grid">
          <section className="story-panel">
            <Scene node={node} clicks={clicks} inspect={inspect} />
            <article className="story-card">
              <div className="chapter-line"><span>{node.final ? "最終節點" : `故事節點 ${node.id}`}</span><span>{here.short} / {danger.label}</span></div>
              <h2>{node.title}</h2>
              <p className="subtitle">{node.subtitle}</p>
              <StoryParagraphs paragraphs={node.paragraphs} now={now} />
              <div className="route-note"><span>你當下的反應</span><p>{node.reactions[pathRoute] || node.reactions.balanced}</p></div>
              {!state.result ? (
                <div className="choices">{node.choices.map((choice, index) => <button className="choice-card" key={`${node.id}-${choice.id}`} onClick={() => choose(choice)}><span className="choice-index">0{index + 1}</span><span className="choice-icon">{choice.icon}</span><span className="choice-label">{choice.label}</span><span className="choice-arrow">→</span></button>)}</div>
              ) : (
                <div className="result-card"><span className="eyebrow">YOUR CHOICE HAS CONSEQUENCES</span><h3>你已經做出選擇</h3><p>{state.result}</p>{!node.final && (canAdvance ? <button className="primary-button" onClick={advance}>走進「{place(state.pending.context).short}」的下一幕 →</button> : <div className="locked-branch"><strong>門後的故事還沒有出現</strong><p>你選好的下一個地點已保存在 Cookie。下一次更新後，這扇門會繼續打開。</p><button className="ghost-button" onClick={() => window.location.reload()}>重新檢查最新章節</button></div>)}</div>
              )}
            </article>
          </section>
          <aside className="status-panel">
            <div className="status-card identity-card"><span className="eyebrow">SUBJECT</span><div className="avatar">Z<span>{loops || ""}</span></div><h3>{routeName(pathRoute)}</h3><p>走過 {state.history.length} 個節點 · 重啟 {loops} 次</p></div>
            <div className="status-card"><div className="status-heading"><h3>目前情況</h3><span>下一幕會延續這些事</span></div><div className="continuity-list"><p><strong>所在地</strong><span>{here.label}</span></p><p><strong>跟著你的東西</strong><span>{danger.entity}</span></p><p><strong>它的態度</strong><span>{state.context.relation}</span></p><p><strong>逼近程度</strong><span>{state.context.pressure} / 9</span></p></div></div>
            <div className="status-card"><div className="status-heading"><h3>你的反應方式</h3></div>{Object.entries(STATS).map(([key, meta]) => <div className="stat-row" key={key}><span>{meta[0]} {meta[1]}</span><div className="stat-bar"><i style={{ width: `${Math.min(100, 18 + Math.max(0, state.stats[key]) * 7)}%` }} /></div><strong>{state.stats[key]}</strong></div>)}</div>
            <div className="status-card"><div className="status-heading"><h3>帶在身上的東西</h3><span>{state.items.length}</span></div><div className="item-list">{state.items.length ? state.items.slice(-7).map((item) => <span key={item}>{item}</span>) : <p>口袋裡還沒有能證明這一晚的東西。</p>}</div></div>
          </aside>
        </div>
      )}

      <footer><span>Browser Cookie · Schema v3</span><span>分支因子 3 · 已釋出深度 {world.releasedDepth}</span></footer>
      {restartOpen && <div className="modal-backdrop" onClick={() => setRestartOpen(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><h2>回到第一個夜晚？</h2><p>目前走過的房間、拿到的東西和做出的選擇都會清空；重啟次數仍會留下。</p><div className="modal-actions"><button className="ghost-button" onClick={() => setRestartOpen(false)}>取消</button><button className="danger-button solid" onClick={reset}>重新開始</button></div></div></div>}
      {archiveOpen && <div className="modal-backdrop" onClick={() => setArchiveOpen(false)}><div className="modal archive-modal" onClick={(event) => event.stopPropagation()}><h2>你真正走過的路</h2><div className="archive-grid"><div><strong>{state.history.length}</strong><span>節點</span></div><div><strong>{state.flags.length}</strong><span>事件</span></div><div><strong>{loops}</strong><span>重啟</span></div></div><div className="path-list">{state.history.length ? state.history.slice(-14).map((entry, index) => <div key={`${entry.node}-${index}`}><span>{String(entry.depth + 1).padStart(2, "0")}</span><p><strong>{entry.location}</strong>－{entry.choice}<small>下一站：{entry.nextLocation}</small></p></div>) : <p>你還坐在第一個房間裡。</p>}</div><button className="primary-button" onClick={() => setArchiveOpen(false)}>回到目前位置</button></div></div>}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
