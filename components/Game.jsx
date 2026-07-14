"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const COOKIE_NAME = "echoes_beneath_state";
const LOOP_COOKIE = "echoes_beneath_loops";

const LOCATIONS = {
  bedroom_desk: { label: "房間的書桌前", short: "書桌", scene: "screen", anchors: ["關機的螢幕", "桌面倒影", "椅背後方"], exits: ["bedroom_door", "bedroom_wall"] },
  bedroom_door: { label: "房門內側", short: "房門", scene: "door", anchors: ["門縫下的光", "冰冷的門把", "窺視孔"], exits: ["bedroom_desk", "apartment_hall"] },
  bedroom_wall: { label: "床頭旁的牆面", short: "牆邊", scene: "wall", anchors: ["牆內的管線", "鬆動的插座", "牆紙接縫"], exits: ["bedroom_desk", "utility_room"] },
  apartment_hall: { label: "住處外的狹長走廊", short: "走廊", scene: "hall", anchors: ["依序亮起的感應燈", "沒有號碼的鄰門", "天花板監視器"], exits: ["bedroom_door", "stairwell", "elevator_lobby"] },
  stairwell: { label: "逃生梯轉角", short: "樓梯間", scene: "stairs", anchors: ["向下延伸的扶手", "半層平台", "防火門玻璃"], exits: ["apartment_hall", "building_lobby", "rooftop_landing"] },
  elevator_lobby: { label: "電梯前的小廳", short: "電梯廳", scene: "elevator", anchors: ["永遠差一層的樓層燈", "兩扇不同步的電梯門", "緊急通話按鈕"], exits: ["apartment_hall", "laundry_room", "building_lobby"] },
  laundry_room: { label: "整棟樓共用的洗衣間", short: "洗衣間", scene: "laundry", anchors: ["沒有插電卻旋轉的洗衣機", "排水孔", "曬衣桿末端"], exits: ["elevator_lobby", "utility_room"] },
  utility_room: { label: "牆後狹窄的維修空間", short: "維修夾層", scene: "pipes", anchors: ["溫熱的水管", "纏成結的電線", "只容一隻手穿過的孔洞"], exits: ["bedroom_wall", "laundry_room", "stairwell"] },
  rooftop_landing: { label: "通往頂樓的最後一段階梯", short: "頂樓門前", scene: "roof", anchors: ["被風壓住的鐵門", "門外逆向飄動的雨", "牆上的舊住戶名冊"], exits: ["stairwell", "rooftop"] },
  rooftop: { label: "沒有其他出口的屋頂", short: "屋頂", scene: "roof", anchors: ["水塔背面", "城市中唯一熄滅的窗", "被剪斷的避雷線"], exits: ["rooftop_landing"] },
  building_lobby: { label: "一樓沒有值班人的大廳", short: "一樓大廳", scene: "lobby", anchors: ["反鎖的玻璃門", "住戶信箱", "停止轉動的監視器"], exits: ["stairwell", "elevator_lobby", "street_entrance"] },
  street_entrance: { label: "大樓門口的騎樓", short: "騎樓", scene: "street", anchors: ["沒有車經過的路口", "映不出你的玻璃門", "持續閃爍的招牌"], exits: ["building_lobby"] }
};

const THREADS = {
  reflection: { label: "倒影先行", entity: "比你早一拍的倒影", lines: ["倒影維持著你幾秒後才會做出的動作。", "所有反光表面都映出同一個不可能的角度。", "倒影先把食指貼在嘴前，等你跟著它。"] },
  threshold: { label: "門檻來客", entity: "始終站在另一側的人", lines: ["有重量停在界線另一側，卻沒有影子越過來。", "同一個人似乎同時站在每一個出口後方。", "你靠近一個出口，另一個出口便傳來三下敲擊。"] },
  voice: { label: "牆後回聲", entity: "借用熟悉聲音的回聲", lines: ["牆後的聲音重複你的選擇，卻把主詞換成自己。", "聲音先模仿你心裡還沒完整形成的下一句。", "管線裡的呼吸能準確說出你停下的位置。"] },
  duplicate: { label: "未選之人", entity: "做了另一個選擇的你", lines: ["另一個你正在完成上一個節點裡沒有被選的動作。", "相同的腳步與你保持同速，方向卻完全相反。", "輪廓帶著你本來可能取得的物品。"] },
  erased: { label: "被刪掉的位置", entity: "沒有被記錄的第四個選項", lines: ["三個選擇之間短暫多出一塊正在向外鼓起的空白。", "附近物件自然地替不存在的人空出位置。", "你記得第四個選項，卻無法想起它寫了什麼。"] }
};

const THREAD_ORDER = Object.keys(THREADS);
const STAT_META = { nerve: { label: "鎮定", icon: "◆" }, insight: { label: "警覺", icon: "◇" }, empathy: { label: "共感", icon: "◌" } };
const ROOT_CONTEXT = { locationId: "bedroom_desk", fromLocationId: null, thread: "reflection", relation: "unknown", pressure: 0, carry: "網站剛剛自行亮起。" };
const DEFAULT_WORLD = {
  schemaVersion: 3,
  releasedDepth: 7,
  final: false,
  layerEvents: [
    { depth: 1, hourKey: "seed-01", motif: "螢幕邊緣浮出一圈霧", distortion: "倒影比你的動作快了半秒", whisper: "「你選的是我，不是門。」" },
    { depth: 2, hourKey: "seed-02", motif: "門把留下從房內握住的指紋", distortion: "走廊的感應燈朝房間方向依序亮起", whisper: "「不要把出口和安全混在一起。」" },
    { depth: 3, hourKey: "seed-03", motif: "牆內傳來規律的三次敲擊", distortion: "敲擊順序正好重播你的選擇", whisper: "「另一個你已經走完這裡。」" },
    { depth: 4, hourKey: "seed-04", motif: "所有鐘面同時少了一分鐘", distortion: "聲音開始比來源更早抵達", whisper: "「相容的路會在下一個轉角交會。」" },
    { depth: 5, hourKey: "seed-05", motif: "空氣裡出現濕冷的金屬味", distortion: "每個出口後都傳來同一雙鞋的摩擦聲", whisper: "「它只能跟著你真正走過的地方。」" },
    { depth: 6, hourKey: "seed-06", motif: "一小塊陰影拒絕跟隨光線移動", distortion: "你沒有選的動作出現在另一個表面上", whisper: "「別讓它冒充已經發生的事。」" },
    { depth: 7, hourKey: "seed-07", motif: "某個出口的門把比室溫低了十幾度", distortion: "異常總會晚一步留下能被追查的痕跡", whisper: "「不要把出口和安全當成同一件事。」" }
  ]
};

const initialState = () => ({ version: 3, nodeKey: "root", depth: 0, context: { ...ROOT_CONTEXT }, history: [], stats: { nerve: 0, insight: 0, empathy: 0 }, flags: [], items: [], result: null, pending: null, ending: null });
const hash = (text) => { let value = 2166136261; for (const char of String(text)) { value ^= char.charCodeAt(0); value = Math.imul(value, 16777619); } return Math.abs(value >>> 0); };
const pick = (list, seed, offset = 0) => list.length ? list[(seed + offset * 7919) % list.length] : null;
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const getLocation = (context) => LOCATIONS[context?.locationId] || LOCATIONS.bedroom_desk;
const getThread = (context) => THREADS[context?.thread] || THREADS.reflection;
const nextThread = (current, offset) => THREAD_ORDER[(THREAD_ORDER.indexOf(current) + offset + THREAD_ORDER.length) % THREAD_ORDER.length];
const routeKey = (stats) => { const entries = Object.entries(stats || {}).sort((a, b) => b[1] - a[1]); return !entries.length || entries[0][1] === entries[1][1] ? "balanced" : entries[0][0]; };
const routeLabel = (route) => ({ nerve: "不回頭的人", insight: "看見規則的人", empathy: "聽見回聲的人", balanced: "尚未被預測的人" }[route] || "尚未被預測的人");
const validateTransition = (from, to) => Boolean(from && to && (from.locationId === to.locationId || LOCATIONS[from.locationId]?.exits.includes(to.locationId)));
const canEnterDepth = (depth, world) => Boolean(world.final || depth <= Number(world.releasedDepth || 0));
const branchCount = (depth) => depth < 13 ? (3 ** depth).toLocaleString("zh-TW") : `約 10^${(depth * Math.log10(3)).toFixed(1)}`;

function normalizeState(value) {
  if (!value || value.version !== 3 || !value.context || !Number.isInteger(value.depth)) return { state: initialState(), migrated: Boolean(value) };
  const base = initialState();
  return { state: { ...base, ...value, stats: { ...base.stats, ...(value.stats || {}) }, history: Array.isArray(value.history) ? value.history.slice(-100) : [], flags: Array.isArray(value.flags) ? value.flags.slice(-100) : [], items: Array.isArray(value.items) ? value.items.slice(-60) : [] }, migrated: false };
}

function rootNode() {
  return {
    id: "root", title: "第一刻：房間多了一個呼吸", subtitle: "三個選擇會把你帶往三個不同的地方。", scene: "screen", accent: "red", context: { ...ROOT_CONTEXT },
    intro: "現在是 {{time}}。你坐在房間的書桌前，網站在沒有通知的情況下自行亮起。喇叭沒有播放任何聲音，但你仍聽見另一段呼吸，像隔著螢幕、門板或牆面其中之一。當你屏住氣，它多呼吸了一次。",
    routeText: { nerve: "你先確認手邊能當作武器的東西，呼吸因此停頓。", insight: "呼吸會在游標停住時變近，它正利用你的注意力定位。", empathy: "呼吸並不平穩，像有人努力忍住哭聲。", balanced: "你還沒有形成固定反應，所以它無法預測你。" },
    choices: [
      { id: "reflection", label: "利用關機螢幕的倒影確認身後", icon: "◉", result: "你沒有回頭。倒影中的你卻已站起來，把臉貼近螢幕內側。你仍坐在原位。接下來，你只能處理這個提早行動的倒影。", effects: { nerve: 1, insight: 2, empathy: 0 }, flag: "root_reflection", nextNodeKey: "branch-reflection", nextContext: { locationId: "bedroom_desk", fromLocationId: "bedroom_desk", thread: "reflection", relation: "watching", pressure: 1, carry: "你留在書桌前，確認異常存在於反光表面。" } },
      { id: "threshold", label: "熄掉桌燈，退到房門內側確保出口", icon: "▯", result: "你退到房門內側，門縫外早已有一雙沒有影子的腳，腳尖朝向房間。從現在起，故事發生在門與走廊之間。", effects: { nerve: 2, insight: 0, empathy: -1 }, flag: "root_threshold", nextNodeKey: "branch-threshold", nextContext: { locationId: "bedroom_door", fromLocationId: "bedroom_desk", thread: "threshold", relation: "hostile", pressure: 2, carry: "你離開書桌，站到房門內側；門外有一雙沒有影子的腳。" } },
      { id: "voice", label: "走到床頭牆邊，把耳朵貼上牆面", icon: "◌", result: "呼吸聲立刻變清楚，接著用你的聲音說：「終於選到我了。」你只能沿著這道牆後聲音追下去。", effects: { nerve: 0, insight: 1, empathy: 2 }, item: "牆後的第一句話", nextNodeKey: "branch-voice", nextContext: { locationId: "bedroom_wall", fromLocationId: "bedroom_desk", thread: "voice", relation: "curious", pressure: 1, carry: "你離開書桌來到床頭牆邊；牆後的聲音已經回答。" } }
    ]
  };
}

function finalNode(state) {
  const location = getLocation(state.context), thread = getThread(state.context);
  return {
    id: `final-${state.nodeKey}`, isFinal: true, title: `最終刻：${location.short}只剩下三種聲音`, subtitle: `你經過 ${state.history.length} 次選擇來到這裡。`, scene: location.scene, accent: "red", context: state.context,
    intro: `7 月 31 日的最後一次更新完成後，${location.label}沒有恢復正常。${thread.entity}承認自己由你每次沒有選擇的結果構成，只能沿著真正走過的場所與線索跟到這裡。`,
    routeText: { nerve: "你能切斷入口，但無法再確認被切斷的分支。", insight: "你看見完整圖形：路線分裂，只在因果相容時交織。", empathy: "每個威脅裡都混著未被選擇者希望留下姓名的請求。", balanced: "你仍保留不屬於任何預測的收尾。" },
    choices: [
      { id: "sever", label: `封死${location.short}的入口並刪除路徑`, icon: "✕", ending: "severed", result: `你關閉與${thread.entity}相連的入口。${location.short}恢復平靜，Cookie 裡留下最後一筆紀錄。——結局：只保留走到這裡的人。`, effects: { nerve: 3, insight: 0, empathy: -2 }, flag: "ending_severed" },
      { id: "map", label: "把走過的節點畫成地圖並保留交織入口", icon: "⌘", ending: "mapped", result: "你按所在地、線索與危險來源建立索引；相容路線可以交會，不相容路線永遠分開。——結局：回聲拓撲圖。", effects: { nerve: 0, insight: 3, empathy: 0 }, item: "完整故事圖" },
      { id: "coexist", label: `讓${thread.entity}留下，但不能改寫已發生的事`, icon: "◇", ending: "coexist", result: `你承認未選的結果也曾可能發生，卻拒絕讓它們冒充目前路線。${location.short}偶爾仍有腳步，但總停在正確界線外。——結局：與未選之人保持距離。`, effects: { nerve: 0, insight: 0, empathy: 3 }, flag: "ending_coexist" }
    ]
  };
}

function dynamicNode(state, world) {
  const context = state.context, location = getLocation(context), thread = getThread(context);
  const event = world.layerEvents?.find((item) => item.depth === state.depth) || { hourKey: `fallback-${state.depth}`, motif: "空氣裡出現淡淡的金屬味", distortion: "附近的聲音比動作晚半秒", whisper: "「別把下一步想得太清楚。」" };
  const seed = hash(`${state.nodeKey}:${state.depth}:${event.hourKey}`);
  const anchor = pick(location.anchors, seed), moveId = pick(location.exits, seed, 1), secondId = pick(location.exits.filter((id) => id !== moveId), seed, 2) || moveId;
  const moveLocation = LOCATIONS[moveId], secondLocation = LOCATIONS[secondId];
  const line = pick(thread.lines, seed, 3), pressure = clamp(Number(context.pressure || 0), 0, 9), nextDepth = state.depth + 1, weave = nextDepth % 4 === 0;
  const inspectThread = nextThread(context.thread, 1 + seed % 2), moveThread = nextThread(context.thread, 2), interactThread = nextThread(context.thread, 3 + seed % 2);
  const inspectContext = { locationId: context.locationId, fromLocationId: context.locationId, thread: inspectThread, relation: context.relation === "hostile" ? "measuring" : "watching", pressure: clamp(pressure + 1, 0, 9), carry: `你沒有離開${location.short}，並從${anchor}確認異常改變了形態。` };
  const moveContext = { locationId: moveId, fromLocationId: context.locationId, thread: moveThread, relation: pressure >= 5 ? "pursuing" : context.relation, pressure: clamp(pressure + 1, 0, 9), carry: `你經由明確出口離開${location.short}並抵達${moveLocation.short}；異常沿著聲音跟來。` };
  const interactLocationId = weave ? secondId : context.locationId;
  const interactContext = { locationId: interactLocationId, fromLocationId: context.locationId, thread: interactThread, relation: context.relation === "hostile" ? "uncertain" : "recognized", pressure: clamp(pressure + (context.relation === "hostile" ? 0 : -1), 0, 9), carry: weave ? `你沿著實際通道抵達${secondLocation.short}；另一條具有相同線索的路線也在此交會。` : `你留在${location.short}，與${thread.entity}建立了可驗證的回應規則。` };
  const nodeKey = (action, nextContext, isWeave = false) => isWeave ? `weave-${hash(`${nextContext.locationId}:${nextContext.thread}:${Math.floor(nextDepth / 4)}`).toString(36)}` : `node-${hash(`${state.nodeKey}:${action}:${nextContext.locationId}:${nextContext.thread}:${nextDepth}`).toString(36)}`;
  const fromText = context.fromLocationId && context.fromLocationId !== context.locationId ? `你從${LOCATIONS[context.fromLocationId]?.short || "上一處"}來到${location.label}` : `你仍在${location.label}`;
  return {
    id: state.nodeKey, title: `第 ${String(state.depth + 1).padStart(2, "0")} 刻：${anchor}沒有照原來的位置存在`, subtitle: `${event.motif}。這一幕只延續你真正走到的${location.short}。`, scene: location.scene, accent: ["red", "amber", "blue", "violet", "green"][seed % 5], context,
    intro: `${fromText}。${context.carry || ""} ${line} ${event.distortion}。當你注意到${anchor}時，${thread.entity}低聲說：${event.whisper}`,
    routeText: { nerve: `你沒有退後。${thread.entity}改變站位，避免正面進入視線。`, insight: `異常只能利用${location.short}目前存在的物件與出口，無法憑空把你移到別處。`, empathy: `${thread.entity}正努力描述一條與你不同、卻能在${location.short}交會的路線。`, balanced: `你尚未形成穩定反應，${thread.entity}無法決定要封鎖哪個出口。` },
    choices: [
      { id: "inspect", label: `留在${location.short}，直接檢查${anchor}`, icon: "◎", result: `你沒有改變所在地。${event.motif}在你碰到前向內縮去，留下${THREADS[inspectThread].label}的痕跡。下一節點仍發生在${location.short}。`, effects: { nerve: 1, insight: 2, empathy: 0 }, flag: `inspected_${context.locationId}_${state.depth}`, nextNodeKey: nodeKey("inspect", inspectContext), nextContext: inspectContext },
      { id: "move", label: `經由可見出口前往${moveLocation.short}`, icon: "→", result: `你確認通道確實連向${moveLocation.label}才離開。抵達後，${THREADS[moveThread].entity}已留下另一種痕跡；它跟得上你，卻不能改寫你經過的路。`, effects: { nerve: 2, insight: 0, empathy: -1 }, flag: `moved_${context.locationId}_to_${moveId}`, nextNodeKey: nodeKey("move", moveContext), nextContext: moveContext },
      { id: "interact", label: weave ? `循著回應前往${secondLocation.short}，確認路線交會` : `不離開${location.short}，要求${thread.entity}回答可驗證問題`, icon: "◇", result: weave ? `你沿著實際存在的通道抵達${secondLocation.label}。另一條分支留下的記號也指向同一處，兩條故事只在場景與線索相容時交織。` : `${thread.entity}回答了只有目前場所才能驗證的細節。你沒有相信它，但確認它與${location.short}屬於同一因果鏈。`, effects: { nerve: 0, insight: 1, empathy: 2 }, item: weave ? `交織座標 ${interactLocationId}-${Math.floor(nextDepth / 4)}` : `可驗證回應 ${state.depth}`, nextNodeKey: nodeKey("interact", interactContext, weave), nextContext: interactContext }
    ]
  };
}

function getNode(state, world) {
  if (state.nodeKey === "root") return rootNode();
  if (world.final && state.depth >= 8) return finalNode(state);
  return dynamicNode(state, world);
}

function readCookie(name) { if (typeof document === "undefined") return null; const row = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`)); return row ? decodeURIComponent(row.split("=").slice(1).join("=")) : null; }
function writeCookie(name, value, days = 180) { const expires = new Date(Date.now() + days * 86400000).toUTCString(); document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; }
function encodeState(value) { try { return btoa(unescape(encodeURIComponent(JSON.stringify(value)))); } catch { return ""; } }
function decodeState(value) { try { return JSON.parse(decodeURIComponent(escape(atob(value)))); } catch { return null; } }
function formatTime(date) { return new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date || new Date()); }
function personalize(text, date) { return String(text || "").replaceAll("{{time}}", formatTime(date)); }

function SceneArt({ node, secretClicks, onSecret }) {
  const location = getLocation(node.context), thread = node.context?.thread || "reflection", palette = { red: ["#ff4b55", "#3c080d"], amber: ["#ffb03b", "#3c2106"], blue: ["#63b3ff", "#071f3c"], violet: ["#b58cff", "#24103f"], green: ["#75e5a1", "#0b3420"] }[node.accent] || ["#ff4b55", "#3c080d"];
  const seed = hash(node.id), points = Array.from({ length: 28 }, (_, index) => ({ x: seed * (index + 13) * 17 % 1000, y: seed * (index + 7) * 29 % 600 }));
  return <button className="art-button" onClick={onSecret} aria-label="調查場景中的異常"><svg className="scene-art" viewBox="0 0 1000 600" role="img" aria-label={`${location.label}恐怖場景`}><defs><linearGradient id={`bg-${node.id}`} x2="1" y2="1"><stop stopColor="#020304"/><stop offset=".66" stopColor="#090b0f"/><stop offset="1" stopColor={palette[1]}/></linearGradient></defs><rect width="1000" height="600" fill={`url(#bg-${node.id})`}/>{points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={index % 6 ? 1 : 2} fill="#fff" opacity=".08"/>)}<path d="M80 560L230 105H770L920 560Z" fill="#050608" stroke="#24292e" strokeWidth="4"/>{(location.scene === "screen" || location.scene === "lobby") && <g><rect x="300" y="140" width="400" height="280" fill="#020304" stroke="#3a4047" strokeWidth="9"/><rect x="325" y="165" width="350" height="230" fill={palette[1]}/></g>}{(location.scene === "door" || location.scene === "hall") && <g><rect x="390" y="125" width="220" height="370" fill="#070707" stroke={palette[0]} strokeWidth="5"/><path d="M420 497H580" stroke="#ffe6ad" strokeWidth="8"/></g>}{location.scene === "wall" && <path d="M430 210q70-80 140 0v230q-70 55-140 0z" fill="#020304" stroke={palette[0]} strokeWidth="4"/>}{location.scene === "stairs" && Array.from({ length: 8 }, (_, index) => <path key={index} d={`M${260 + index * 35} ${510 - index * 38}H${610 + index * 12}`} stroke="#3b4045" strokeWidth="13"/>)}{location.scene === "elevator" && <g><rect x="330" y="120" width="340" height="400" fill="#08090a" stroke="#4a4f55" strokeWidth="8"/><path d="M500 120V520" stroke="#34393e" strokeWidth="5"/></g>}{location.scene === "laundry" && <g><circle cx="410" cy="320" r="105" fill="#070809" stroke="#4a5056" strokeWidth="12"/><circle cx="590" cy="320" r="105" fill="#070809" stroke="#4a5056" strokeWidth="12"/></g>}{location.scene === "pipes" && <path d="M220 160H760M280 110V540M710 110V540" stroke="#464b50" strokeWidth="26"/>}{location.scene === "roof" && <path d="M80 450L250 300 410 390 590 260 760 390 920 280V560H80Z" fill="#030405"/>}{location.scene === "street" && <path d="M110 470H890M500 120V480" stroke="#373c41" strokeWidth="16"/>}{thread === "reflection" && <g><circle cx="465" cy="325" r="7" fill={palette[0]}/><circle cx="535" cy="325" r="7" fill={palette[0]}/></g>}{thread === "threshold" && <path d="M500 190C430 230 420 390 435 530H565C580 390 570 230 500 190Z" fill="#010203"/>}{thread === "voice" && <path d="M410 300Q500 220 590 300M390 350Q500 260 610 350" fill="none" stroke={palette[0]} strokeWidth="5"/>}{thread === "duplicate" && <g><path d="M445 520C445 370 468 250 500 230C532 250 555 370 555 520Z" fill="#010203"/><path d="M555 520C555 390 578 280 610 260C642 280 665 390 665 520Z" fill="#010203"/></g>}{thread === "erased" && <rect x="420" y="180" width="160" height="300" fill="#000" stroke={palette[0]} strokeDasharray="12 15" strokeWidth="4"/>}<ellipse cx="855" cy="92" rx={secretClicks >= 6 ? 70 : 42} ry={secretClicks >= 6 ? 28 : 10} fill="#020304" stroke={palette[0]} strokeWidth="3"/><circle cx="855" cy="92" r={secretClicks >= 6 ? 15 : 6} fill={palette[0]}/><text x="32" y="48" fill="#fff" opacity=".38" fontSize="17">ECHOES // {node.id.toUpperCase()}</text></svg><span className="art-hint">畫面右上角似乎有東西</span></button>;
}

export default function Game() {
  const [world, setWorld] = useState(DEFAULT_WORLD), [state, setState] = useState(initialState()), [ready, setReady] = useState(false), [now, setNow] = useState(new Date()), [loops, setLoops] = useState(0), [showRestart, setShowRestart] = useState(false), [showArchive, setShowArchive] = useState(false), [toast, setToast] = useState(""), [secretClicks, setSecretClicks] = useState(0), [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef(null);
  useEffect(() => { const normalized = normalizeState(decodeState(readCookie(COOKIE_NAME) || "")); setState(normalized.state); setLoops(Number(readCookie(LOOP_COOKIE) || 0)); if (normalized.migrated) setToast("舊版存檔已轉換，故事從樹狀根節點重新開始。"); fetch(`https://raw.githubusercontent.com/2lll5/Echoes-Beneath/main/public/story.generated.json?t=${Date.now()}`, { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => { if (data?.schemaVersion === 3) setWorld(data); }).catch(() => setWorld(DEFAULT_WORLD)).finally(() => setReady(true)); }, []);
  useEffect(() => { if (ready) writeCookie(COOKIE_NAME, encodeState(state)); }, [state, ready]);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(timer); }, []);
  useEffect(() => { let idle; const reset = () => { clearTimeout(idle); idle = setTimeout(() => setToast("你很久沒有移動。這條路線裡只有你停了下來。"), 23000); }; const visibility = () => { if (document.hidden) document.title = "你離開了。這條分支沒有。"; else { document.title = "Echoes Beneath｜底下的回聲"; setToast("你回來了。所在地沒變，但有個物件的位置不同。" ); } }; ["mousemove", "keydown", "touchstart", "scroll"].forEach((event) => addEventListener(event, reset, { passive: true })); document.addEventListener("visibilitychange", visibility); reset(); return () => { clearTimeout(idle); ["mousemove", "keydown", "touchstart", "scroll"].forEach((event) => removeEventListener(event, reset)); document.removeEventListener("visibilitychange", visibility); }; }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 4600); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => () => { audioRef.current?.close(); }, []);
  const current = useMemo(() => getNode(state, world), [state, world]), location = getLocation(state.context), thread = getThread(state.context), route = routeKey(state.stats), pendingUnlocked = state.pending ? canEnterDepth(state.pending.depth, world) : false, progress = Math.min(100, state.depth / Math.max(Number(world.releasedDepth || 1), 1) * 100);
  const choose = (choice, index) => { if (state.result || state.ending) return; if (!current.isFinal && !validateTransition(state.context, choice.nextContext)) return setToast("連貫性檢查阻止了一個不可能的場景跳轉。"); const stats = { ...state.stats }; Object.entries(choice.effects || {}).forEach(([key, value]) => { stats[key] = (stats[key] || 0) + value; }); const result = personalize(choice.result, now), nextLocation = choice.nextContext ? getLocation(choice.nextContext) : location; const entry = { nodeKey: state.nodeKey, depth: state.depth, location: location.short, choiceLabel: choice.label, result, nextLocation: nextLocation.short }; setState((previous) => ({ ...previous, stats, flags: choice.flag ? [...new Set([...previous.flags, choice.flag])].slice(-100) : previous.flags, items: choice.item ? [...new Set([...previous.items, choice.item])].slice(-60) : previous.items, history: [...previous.history, entry].slice(-100), result, pending: current.isFinal ? null : { nodeKey: choice.nextNodeKey, context: choice.nextContext, depth: previous.depth + 1 }, ending: current.isFinal ? choice.ending : previous.ending })); };
  const advance = () => { if (!state.pending || !pendingUnlocked) return; setState((previous) => ({ ...previous, nodeKey: previous.pending.nodeKey, context: previous.pending.context, depth: previous.pending.depth, result: null, pending: null })); setSecretClicks(0); };
  const restart = () => { const next = loops + 1; writeCookie(LOOP_COOKIE, String(next)); setLoops(next); setState(initialState()); setShowRestart(false); setSecretClicks(0); setToast(next === 3 ? "第三次重來後，根節點記得你曾選過另外兩條路。" : "分支樹已重置，但世界保留重啟次數。"); };
  const inspect = () => { const next = secretClicks + 1; setSecretClicks(next); if (next === 3) setToast(`它剛才看向${location.short}的出口。`); if (next === 6) { setToast("彩蛋：獲得拓撲之眼。"); setState((previous) => ({ ...previous, items: [...new Set([...previous.items, "拓撲之眼"])] })); } };
  const toggleSound = async () => { if (soundOn) { await audioRef.current?.close(); audioRef.current = null; setSoundOn(false); return; } const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) return; const context = new AudioContext(), master = context.createGain(); master.gain.value = .025; master.connect(context.destination); [43, 57, 86].forEach((frequency, index) => { const oscillator = context.createOscillator(), gain = context.createGain(); oscillator.type = index === 2 ? "sine" : "triangle"; oscillator.frequency.value = frequency; gain.gain.value = index === 2 ? .16 : .32; oscillator.connect(gain).connect(master); oscillator.start(); }); audioRef.current = context; setSoundOn(true); setToast("環境音已開啟。有些腳步只會在目前所在地出現。" ); };
  if (!ready) return <main className="loading-screen"><div className="loader"/><p>正在確認故事連線……</p></main>;
  return <main className="game-shell" onPointerMove={(event) => { event.currentTarget.style.setProperty("--mx", ((event.clientX / innerWidth - .5) * 2).toFixed(3)); event.currentTarget.style.setProperty("--my", ((event.clientY / innerHeight - .5) * 2).toFixed(3)); }}><div className="noise"/><div className="watcher" aria-hidden="true"><i/><i/></div><header className="topbar"><div><span className="eyebrow">BRANCHING HORROR GRAPH / COOKIE MEMORY</span><h1>Echoes Beneath <small>底下的回聲</small></h1></div><div className="header-actions"><button className="ghost-button" onClick={toggleSound}>{soundOn ? "關閉環境音" : "開啟環境音"}</button><button className="ghost-button" onClick={() => setShowArchive(true)}>分支路徑</button><button className="danger-button" onClick={() => setShowRestart(true)}>重新開始</button></div></header><section className="presence-strip"><span className="live-dot"/><p>本地時間 <strong>{formatTime(now)}</strong> · 目前所在地：<strong>{location.short}</strong></p><span>已釋出深度 {world.releasedDepth} · 7/31 收尾</span></section><section className="progress-wrap"><div className="progress-meta"><span>故事深度 {state.depth} / {world.releasedDepth} · 理論路徑 {branchCount(world.releasedDepth)}</span><span>{routeLabel(route)} · {thread.label}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }}/></div></section>{state.ending ? <section className="ending-card"><span className="eyebrow">THE END REMEMBERS THE WHOLE PATH</span><h2>{location.short}終於安靜下來</h2><p>{state.result}</p><p className="ending-code">結局：{state.ending} · 經過 {state.history.length} 個節點</p><button className="danger-button solid" onClick={() => setShowRestart(true)}>回到根節點</button></section> : <div className="game-grid"><section className="story-panel"><SceneArt node={current} secretClicks={secretClicks} onSecret={inspect}/><article className="story-card"><div className="chapter-line"><span>{current.isFinal ? "最終節點" : `故事節點 ${current.id}`}</span><span>{location.short} / {thread.label}</span></div><h2>{current.title}</h2><p className="subtitle">{current.subtitle}</p><p className="story-copy">{personalize(current.intro, now)}</p><div className="route-note"><span>這條路線的反應</span><p>{personalize(current.routeText?.[route] || current.routeText?.balanced, now)}</p></div>{!state.result ? <div className="choices">{current.choices.map((choice, index) => <button className="choice-card" key={`${current.id}-${choice.id}`} onClick={() => choose(choice, index)}><span className="choice-index">0{index + 1}</span><span className="choice-icon">{choice.icon}</span><span className="choice-label">{choice.label}</span><span className="choice-arrow">→</span></button>)}</div> : <div className="result-card"><span className="eyebrow">CHOICE STORED WITH ITS NEXT NODE</span><h3>所在地與威脅已改變</h3><p>{state.result}</p>{current.isFinal ? null : pendingUnlocked ? <button className="primary-button" onClick={advance}>進入「{getLocation(state.pending.context).short}」的下一節點 →</button> : <div className="locked-branch"><strong>這條分支尚未釋出下一層</strong><p>下一個所在地已保存在 Cookie，不會硬接回其他故事。</p><button className="ghost-button" onClick={() => location.reload()}>檢查整點更新</button></div>}</div>}</article></section><aside className="status-panel"><div className="status-card identity-card"><span className="eyebrow">SUBJECT</span><div className="avatar">Z<span>{loops || ""}</span></div><h3>{routeLabel(route)}</h3><p>走過 {state.history.length} 個節點 · 重啟 {loops} 次</p></div><div className="status-card"><div className="status-heading"><h3>連貫性狀態</h3><span>決定下一幕</span></div><div className="continuity-list"><p><strong>所在地</strong><span>{location.label}</span></p><p><strong>危險來源</strong><span>{thread.entity}</span></p><p><strong>關係</strong><span>{state.context.relation}</span></p><p><strong>壓力</strong><span>{state.context.pressure} / 9</span></p></div></div><div className="status-card"><div className="status-heading"><h3>心理輪廓</h3></div>{Object.entries(STAT_META).map(([key, meta]) => <div className="stat-row" key={key}><span>{meta.icon} {meta.label}</span><div className="stat-bar"><i style={{ width: `${Math.min(100, 18 + Math.max(0, state.stats[key]) * 7)}%` }}/></div><strong>{state.stats[key]}</strong></div>)}</div><div className="status-card"><div className="status-heading"><h3>線索</h3><span>{state.items.length}</span></div><div className="item-list">{state.items.length ? state.items.slice(-7).map((item) => <span key={item}>{item}</span>) : <p>尚無線索。</p>}</div></div></aside></div>}<footer><span>Browser Cookie · Schema v3</span><span>分支因子 3 · 已釋出深度 {world.releasedDepth}</span></footer>{showRestart && <div className="modal-backdrop" onClick={() => setShowRestart(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><h2>回到根節點？</h2><p>目前路徑、所在地、數值與線索會清空；重啟次數保留。</p><div className="modal-actions"><button className="ghost-button" onClick={() => setShowRestart(false)}>取消</button><button className="danger-button solid" onClick={restart}>清除路徑</button></div></div></div>}{showArchive && <div className="modal-backdrop" onClick={() => setShowArchive(false)}><div className="modal archive-modal" onClick={(event) => event.stopPropagation()}><h2>你真正走過的路</h2><div className="archive-grid"><div><strong>{state.history.length}</strong><span>節點</span></div><div><strong>{state.flags.length}</strong><span>事件</span></div><div><strong>{loops}</strong><span>重啟</span></div></div><div className="path-list">{state.history.length ? state.history.slice(-14).map((entry, index) => <div key={`${entry.nodeKey}-${index}`}><span>{String(entry.depth + 1).padStart(2, "0")}</span><p><strong>{entry.location}</strong>－{entry.choiceLabel}<small>下一站：{entry.nextLocation}</small></p></div>) : <p>尚未離開根節點。</p>}</div><button className="primary-button" onClick={() => setShowArchive(false)}>回到目前節點</button></div></div>}{toast && <div className="toast">{toast}</div>}</main>;
}
