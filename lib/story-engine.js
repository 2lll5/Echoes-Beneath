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
  reflection: { label: "倒影先行", entity: "比你早一拍的倒影", manifestations: ["倒影沒有照著你現在的姿勢站著，而是維持著你幾秒後才會做出的動作。", "所有可反光的表面都映出同一個角度，像有另一台看不見的攝影機正對著你。", "倒影把食指貼在嘴前；現實中的你還沒有抬手，它卻已經知道你打算出聲。"] },
  threshold: { label: "門檻來客", entity: "始終站在另一側的人", manifestations: ["有重量停在界線另一側，卻沒有任何影子越過來。", "門縫、轉角與出口同時傳來衣料摩擦聲，像同一個人正站在所有離開方式後面。", "你每靠近一個出口，另一個出口便傳來三下很輕的敲擊。"] },
  voice: { label: "牆後回聲", entity: "借用熟悉聲音的回聲", manifestations: ["牆後的聲音重複你上一個選擇，卻把主詞換成了自己的名字。", "那個聲音沒有直接回答，而是先模仿你心裡準備好的下一句。", "管線裡傳來一段很近的呼吸；每次你移動，它都能準確說出你停下的位置。"] },
  duplicate: { label: "未選之人", entity: "做了另一個選擇的你", manifestations: ["你看見一個與自己身形相同的輪廓，正在完成上一個節點裡你沒有選的動作。", "另一個你的腳步與你保持相同速度，方向卻正好相反。", "那個輪廓帶著你本來可能取得的物品，並質問你為什麼只有目前這條路有名字。"] },
  erased: { label: "被刪掉的位置", entity: "沒有被記錄的第四個選項", manifestations: ["三個選擇之間短暫多出一塊空白；空白裡有東西正從另一側按壓畫面。", "附近所有物件都自然地替某個不存在的人空出位置。", "你能清楚記得剛才有第四個選項，卻無法想起它寫了什麼。"] }
};
const THREAD_ORDER = ["reflection", "threshold", "voice", "duplicate", "erased"];

export const STAT_META = { nerve: { label: "鎮定", icon: "◆" }, insight: { label: "警覺", icon: "◇" }, empathy: { label: "共感", icon: "◌" } };
export const ROOT_CONTEXT = { locationId: "bedroom_desk", fromLocationId: null, thread: "reflection", entity: "房間裡多出來的呼吸", relation: "unknown", pressure: 0, carry: "網站剛剛自行亮起。" };

export function createInitialState() {
  return { version: 3, nodeKey: "root", depth: 0, context: { ...ROOT_CONTEXT }, history: [], stats: { nerve: 0, insight: 0, empathy: 0 }, flags: [], items: [], result: null, pending: null, ending: null };
}

export function normalizeState(saved) {
  if (!saved || saved.version !== 3 || !saved.context || !Number.isInteger(saved.depth)) return { state: createInitialState(), migrated: Boolean(saved) };
  return { state: { ...createInitialState(), ...saved, stats: { ...createInitialState().stats, ...(saved.stats || {}) }, history: Array.isArray(saved.history) ? saved.history.slice(-80) : [], flags: Array.isArray(saved.flags) ? saved.flags.slice(-80) : [], items: Array.isArray(saved.items) ? saved.items.slice(-48) : [] }, migrated: false };
}

export function getDominantRoute(stats) {
  const entries = Object.entries(stats || {}).sort((a, b) => b[1] - a[1]);
  if (!entries.length || entries[0][1] === entries[1][1]) return "balanced";
  return entries[0][0];
}
export function routeLabel(route) { return { nerve: "不回頭的人", insight: "看見規則的人", empathy: "聽見回聲的人", balanced: "尚未被預測的人" }[route] || "尚未被預測的人"; }
export function getLocation(context) { return LOCATIONS[context?.locationId] || LOCATIONS.bedroom_desk; }
export function getThread(context) { return THREADS[context?.thread] || THREADS.reflection; }
export function getSceneAssetKey(context) { return `${context?.locationId || "bedroom_desk"}-${context?.thread || "reflection"}`; }

function hash(text) { let value = 2166136261; for (const char of String(text)) { value ^= char.charCodeAt(0); value = Math.imul(value, 16777619); } return Math.abs(value >>> 0); }
function pick(list, seed, offset = 0) { return list.length ? list[(seed + offset * 7919) % list.length] : ""; }
function cap(value, min, max) { return Math.max(min, Math.min(max, value)); }
function eventForDepth(world, depth) {
  const events = Array.isArray(world?.layerEvents) ? world.layerEvents : [];
  return events.find((event) => event.depth === depth) || { depth, motif: "空氣裡淡淡的金屬味", distortion: "附近的聲音比動作晚了半秒才出現", whisper: "「別把下一步想得太清楚。」", hourKey: `fallback-${depth}` };
}
function nextThread(thread, mode, seed) {
  const index = THREAD_ORDER.indexOf(thread);
  if (mode === "inspect") return THREAD_ORDER[(index + 1 + (seed % 2)) % THREAD_ORDER.length];
  if (mode === "move") return THREAD_ORDER[(index + 2) % THREAD_ORDER.length];
  return THREAD_ORDER[(index + 3 + (seed % 2)) % THREAD_ORDER.length];
}
function nextKey(nodeKey, choiceId, context, depth, allowWeave = false) {
  const signature = `${context.locationId}:${context.thread}:${context.relation}:${Math.floor(depth / 4)}`;
  if (allowWeave) return `weave-${hash(signature).toString(36)}`;
  return `node-${hash(`${nodeKey}:${choiceId}:${signature}:${depth}`).toString(36)}`;
}

function makeRootNode() {
  return {
    id: "root", depth: 0, title: "第一刻：房間多了一個呼吸", subtitle: "三個選擇會把你帶往三個不同的地方；故事不會再自動把它們接回同一條線。", scene: "screen", accent: "red", context: { ...ROOT_CONTEXT },
    intro: "現在是 {{time}}。你坐在房間的書桌前，網站在沒有通知的情況下自行亮起。喇叭沒有播放任何聲音，但你仍聽見另一段呼吸，像隔著螢幕、門板或牆面其中之一。當你屏住氣，它多呼吸了一次。",
    routeText: { nerve: "你先確認手邊能當作武器的東西。呼吸聲因此停頓，像在重新評估你。", insight: "你發現呼吸會在游標停住時變近；它正在利用你的注意力定位。", empathy: "那段呼吸並不平穩，像有人努力忍住不讓你聽見哭聲。", balanced: "你尚未形成固定反應，所以它無法預測你會先看向哪裡。" },
    choices: [
      { id: "follow-reflection", label: "利用關機螢幕的倒影，確認聲音是否在身後", icon: "◉", result: "你沒有回頭，只看著黑色螢幕。倒影裡的房門仍關著，但倒影中的你已經站了起來，正把臉貼近螢幕內側。你仍坐在原位。接下來，你只能繼續處理這個提早行動的倒影。", effects: { nerve: 1, insight: 2, empathy: 0 }, flag: "root_reflection_chosen", nextNodeKey: "branch-reflection", nextContext: { locationId: "bedroom_desk", fromLocationId: "bedroom_desk", thread: "reflection", entity: "比你早一拍的倒影", relation: "watching", pressure: 1, carry: "你留在書桌前，並確認異常存在於所有反光表面。" } },
      { id: "retreat-to-door", label: "熄掉桌燈，退到房門內側，先確保出口", icon: "▯", result: "桌燈熄滅後，螢幕倒影消失。你退到房門內側，卻發現門縫外早已有一雙腳。它沒有影子，腳尖正朝著你的房間。從這一刻起，你的故事發生在門與走廊之間。", effects: { nerve: 2, insight: 0, empathy: -1 }, flag: "root_threshold_chosen", nextNodeKey: "branch-threshold", nextContext: { locationId: "bedroom_door", fromLocationId: "bedroom_desk", thread: "threshold", entity: "始終站在另一側的人", relation: "hostile", pressure: 2, carry: "你已離開書桌，站到房門內側；門外有一雙沒有影子的腳。" } },
      { id: "answer-wall", label: "不看螢幕也不靠近門，把耳朵貼上床頭牆面", icon: "◌", result: "你走到床頭旁，把耳朵貼上牆。呼吸聲立刻變得清楚，接著用你的聲音說：「終於選到我了。」牆內有東西知道另外兩條路發生了什麼，但你現在只能沿著這道聲音追下去。", effects: { nerve: 0, insight: 1, empathy: 2 }, item: "牆後的第一句話", nextNodeKey: "branch-voice", nextContext: { locationId: "bedroom_wall", fromLocationId: "bedroom_desk", thread: "voice", entity: "借用你聲音的牆後回聲", relation: "curious", pressure: 1, carry: "你離開書桌來到床頭牆邊；牆後的聲音已經回答你。" } }
    ]
  };
}

function buildFinalNode(state) {
  const location = getLocation(state.context), thread = getThread(state.context), count = state.history.length;
  return { id: `final-${state.nodeKey}`, depth: state.depth, isFinal: true, title: `最終刻：${location.short}只剩下三種聲音`, subtitle: `你經過 ${count} 次選擇來到這裡；另外的路徑也正從相容的入口靠近。`, scene: location.scene, accent: "red", context: state.context,
    intro: `7 月 31 日的最後一次更新完成後，${location.label}沒有立刻恢復正常。${thread.entity}承認自己不是固定躲在某個地方；它由你每次沒有選擇的結果構成，沿著仍然連貫的場所與線索一路跟到這裡。它沒有要求你相信，而是把最後三種處理方式放在你面前。`,
    routeText: { nerve: "你可以切斷所有入口，但切斷也代表永遠無法確認那些分支是否仍存在。", insight: "你已看出完整圖形：路線會分裂，只有場景與線索相容時才會重新交織。", empathy: "你聽見的每一個威脅裡，都混著未被選擇者希望留下姓名的請求。", balanced: "你從未讓任何單一傾向完全支配路線，因此仍能做出不符合預測的收尾。" },
    choices: [
      { id: "ending-sever", label: `封死${location.short}的所有入口，刪除這條路徑`, icon: "✕", ending: "severed", result: `你逐一關閉與${thread.entity}相連的入口。${location.short}恢復平靜，Cookie 裡的路徑仍留下最後一筆紀錄，證明你曾經選擇讓其他自己消失。——結局：只保留走到這裡的人。`, effects: { nerve: 3, insight: 0, empathy: -2 }, flag: "ending_severed" },
      { id: "ending-map", label: "把走過的節點畫成地圖，保留所有可交織的入口", icon: "⌘", ending: "mapped", result: "你沒有讓分支無限混在一起，而是按所在地、線索與危險來源建立索引。相容的路線可以交會，不相容的路線永遠保持分開。網站從恐怖故事變成一張仍會呼吸的地圖。——結局：回聲拓撲圖。", effects: { nerve: 0, insight: 3, empathy: 0 }, item: "完整故事圖" },
      { id: "ending-accept", label: `讓${thread.entity}留下，但不允許它改寫已發生的事情`, icon: "◇", ending: "coexist", result: `你承認未選的結果也曾經有可能發生，卻拒絕讓它們冒充目前這條路。${location.short}仍偶爾傳來另一個你的腳步，但每次都停在正確的界線外。——結局：與未選之人保持距離。`, effects: { nerve: 0, insight: 0, empathy: 3 }, flag: "ending_coexist" }
    ]
  };
}

function buildGeneratedNode(state, world) {
  const context = state.context, location = getLocation(context), thread = getThread(context), event = eventForDepth(world, state.depth), seed = hash(`${state.nodeKey}:${state.depth}:${event.hourKey}`);
  const anchor = pick(location.anchors, seed), exitId = pick(location.exits, seed, 1), alternateExitId = pick(location.exits.filter((id) => id !== exitId), seed, 2) || exitId;
  const exit = LOCATIONS[exitId], alternateExit = LOCATIONS[alternateExitId], manifestation = pick(thread.manifestations, seed, 3), from = context.fromLocationId && LOCATIONS[context.fromLocationId];
  const arrival = from && context.fromLocationId !== context.locationId ? `你從${from.short}來到${location.label}` : `你仍在${location.label}`;
  const carry = context.carry ? `${context.carry} ` : "", pressure = cap(Number(context.pressure || 0), 0, 9);
  const inspectThread = nextThread(context.thread, "inspect", seed), moveThread = nextThread(context.thread, "move", seed), speakThread = nextThread(context.thread, "speak", seed);
  const inspectContext = { locationId: context.locationId, fromLocationId: context.locationId, thread: inspectThread, entity: THREADS[inspectThread].entity, relation: context.relation === "hostile" ? "measuring" : "watching", pressure: cap(pressure + 1, 0, 9), carry: `你沒有離開${location.short}，並從${anchor}確認異常已改變形態。` };
  const moveContext = { locationId: exitId, fromLocationId: context.locationId, thread: moveThread, entity: THREADS[moveThread].entity, relation: pressure >= 5 ? "pursuing" : context.relation, pressure: cap(pressure + 1, 0, 9), carry: `你經由通往${exit.short}的出口離開${location.short}；原本的異常沿著聲音跟了過來。` };
  const weaveDepth = state.depth + 1, allowWeave = weaveDepth % 4 === 0, interactLocationId = allowWeave ? alternateExitId : context.locationId;
  const interactContext = { locationId: interactLocationId, fromLocationId: context.locationId, thread: speakThread, entity: THREADS[speakThread].entity, relation: context.relation === "hostile" ? "uncertain" : "recognized", pressure: cap(pressure + (context.relation === "hostile" ? 0 : -1), 0, 9), carry: allowWeave ? `你跟隨回應來到${alternateExit.short}；另一條具有相同線索的路線也在此交會。` : `你留在${location.short}與${thread.entity}建立了可被驗證的回應規則。` };
  return { id: state.nodeKey, depth: state.depth, title: `第 ${String(state.depth + 1).padStart(2, "0")} 刻：${anchor}沒有照原來的位置存在`, subtitle: `${event.motif}。這一幕只延續你真正走到的${location.short}。`, scene: location.scene, accent: ["red", "amber", "blue", "violet", "green"][seed % 5], context,
    intro: `${arrival}。${carry}${manifestation} ${event.distortion}。當你注意到${anchor}時，${thread.entity}低聲說：${event.whisper}`,
    routeText: { nerve: `你沒有退後。${thread.entity}改變站位，避免正面進入你的視線。`, insight: `你確認異常只能利用${location.short}目前存在的物件與出口；它無法憑空把你移到另一個場所。`, empathy: `你聽出${thread.entity}正在努力描述一條與你不同、卻能在${location.short}交會的路線。`, balanced: `你仍未形成穩定反應，這讓${thread.entity}無法決定要封鎖哪一個出口。` },
    choices: [
      { id: "inspect", label: `留在${location.short}，直接檢查${anchor}`, icon: "◎", result: `你沒有改變所在地，而是靠近${anchor}。${event.motif}在你碰到之前向內縮去，留下${THREADS[inspectThread].label}的痕跡。下一個節點仍會發生在${location.short}，但威脅已經換了形態。`, effects: { nerve: 1, insight: 2, empathy: 0 }, flag: `inspected_${context.locationId}_${state.depth}`, nextNodeKey: nextKey(state.nodeKey, "inspect", inspectContext, weaveDepth), nextContext: inspectContext },
      { id: "move", label: `經由明確可見的出口前往${exit.short}`, icon: "→", result: `你確認通道確實連向${exit.label}後才離開。抵達時，${THREADS[moveThread].entity}已用另一種方式留下痕跡；它跟得上你，卻不能改寫你剛才經過的路。`, effects: { nerve: 2, insight: 0, empathy: -1 }, flag: `moved_${context.locationId}_to_${exitId}`, nextNodeKey: nextKey(state.nodeKey, "move", moveContext, weaveDepth), nextContext: moveContext },
      { id: "interact", label: allowWeave ? `循著回應前往${alternateExit.short}，確認是否有另一條路在此交會` : `不離開${location.short}，要求${thread.entity}回答一個可驗證的問題`, icon: "◇", result: allowWeave ? `你沿著實際存在的通道抵達${alternateExit.label}。另一條分支留下的記號也指向同一處；兩條故事第一次在場景與線索都相容的情況下交織。` : `${thread.entity}回答了只有目前這個場所才能驗證的細節。你沒有因此相信它，但確定它與${location.short}的異常屬於同一條因果鏈。`, effects: { nerve: 0, insight: 1, empathy: 2 }, item: allowWeave ? `交織座標 ${interactLocationId}-${Math.floor(weaveDepth / 4)}` : `可驗證回應 ${state.depth}`, nextNodeKey: nextKey(state.nodeKey, "interact", interactContext, weaveDepth, allowWeave), nextContext: interactContext }
    ]
  };
}

export function getStoryNode(state, world) { if (!state || state.nodeKey === "root") return makeRootNode(); if (Boolean(world?.final) && state.depth >= 8) return buildFinalNode(state); return buildGeneratedNode(state, world); }
export function canEnterDepth(depth, world) { if (world?.final && depth >= 8) return true; return depth <= Number(world?.releasedDepth || 0); }
export function theoreticalBranchCount(depth) { if (depth <= 0) return "1"; if (depth < 13) return (3 ** depth).toLocaleString("zh-TW"); const exponent = depth * Math.log10(3); return `約 10^${exponent.toFixed(1)}`; }
export function validateTransition(currentContext, nextContext) { if (!currentContext || !nextContext) return false; if (currentContext.locationId === nextContext.locationId) return true; return Boolean(LOCATIONS[currentContext.locationId]?.exits?.includes(nextContext.locationId)); }
