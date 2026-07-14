"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  STAT_META,
  canEnterDepth,
  createInitialState,
  getDominantRoute,
  getLocation,
  getSceneAssetKey,
  getStoryNode,
  getThread,
  normalizeState,
  routeLabel,
  theoreticalBranchCount,
  validateTransition
} from "../lib/story-engine";

const COOKIE_NAME = "echoes_beneath_state";
const LOOP_COOKIE = "echoes_beneath_loops";
const DEFAULT_WORLD = {
  schemaVersion: 3,
  generatedAt: "2026-07-14T08:00:00.000Z",
  timezone: "Asia/Taipei",
  finalScheduledAt: "2026-07-31T23:00:00+08:00",
  releasedDepth: 6,
  final: false,
  layerEvents: [
    { depth: 1, hourKey: "seed-01", motif: "螢幕邊緣浮出一圈霧", distortion: "倒影比你的動作快了半秒", whisper: "「你選的是我，不是門。」" },
    { depth: 2, hourKey: "seed-02", motif: "門把留下從房內握住的指紋", distortion: "走廊的感應燈朝房間方向依序亮起", whisper: "「不要把出口和安全混在一起。」" },
    { depth: 3, hourKey: "seed-03", motif: "牆內傳來規律的三次敲擊", distortion: "敲擊順序正好重播你的選擇", whisper: "「另一個你已經走完這裡。」" },
    { depth: 4, hourKey: "seed-04", motif: "所有鐘面同時少了一分鐘", distortion: "聲音開始比來源更早抵達", whisper: "「相容的路會在下一個轉角交會。」" },
    { depth: 5, hourKey: "seed-05", motif: "空氣裡出現濕冷的金屬味", distortion: "每個出口後都傳來同一雙鞋的摩擦聲", whisper: "「它只能跟著你真正走過的地方。」" },
    { depth: 6, hourKey: "seed-06", motif: "一小塊陰影拒絕跟隨光線移動", distortion: "你沒有選的動作出現在另一個表面上", whisper: "「別讓它冒充已經發生的事。」" }
  ]
};

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const row = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.split("=").slice(1).join("=")) : null;
}
function writeCookie(name, value, days = 180) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}
function encodeState(value) { try { return btoa(unescape(encodeURIComponent(JSON.stringify(value)))); } catch { return ""; } }
function decodeState(value) { try { return JSON.parse(decodeURIComponent(escape(atob(value)))); } catch { return null; } }
function formatTime(date = new Date()) { return new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date); }
function personalize(text, now) { return String(text || "").replaceAll("{{time}}", formatTime(now)).replaceAll("{{hour}}", String(now.getHours()).padStart(2, "0")); }

function SceneArt({ node, secretClicks, onSecret }) {
  const assetKey = getSceneAssetKey(node.context);
  const [imageFailed, setImageFailed] = useState(false);
  const scene = node.scene || getLocation(node.context).scene;
  const thread = node.context?.thread || "reflection";
  const palette = { red: ["#ff4b55", "#3c080d"], amber: ["#ffb03b", "#3c2106"], blue: ["#63b3ff", "#071f3c"], violet: ["#b58cff", "#24103f"], green: ["#75e5a1", "#0b3420"] }[node.accent] || ["#ff4b55", "#3c080d"];
  useEffect(() => setImageFailed(false), [assetKey]);
  const seed = [...node.id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  const dust = useMemo(() => Array.from({ length: 36 }, (_, index) => ({ x: (seed * (index + 13) * 17) % 1000, y: (seed * (index + 7) * 29) % 600, r: index % 7 === 0 ? 2.1 : 0.9 })), [seed]);
  if (!imageFailed) return <button className="art-button image-art" onClick={onSecret} aria-label="調查場景中的異常"><img src={`/art/${assetKey}.png`} alt={`${node.title} 場景插畫`} onError={() => setImageFailed(true)} /><span className="art-hint">點擊畫面調查異常</span></button>;

  return (
    <button className="art-button" onClick={onSecret} aria-label="調查場景中的異常">
      <svg className="scene-art" viewBox="0 0 1000 600" role="img" aria-label={`${scene} 動態恐怖場景`}>
        <defs>
          <linearGradient id={`bg-${node.id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#020304" /><stop offset="0.62" stopColor="#090b0f" /><stop offset="1" stopColor={palette[1]} /></linearGradient>
          <radialGradient id={`glow-${node.id}`}><stop offset="0" stopColor={palette[0]} stopOpacity="0.75" /><stop offset="1" stopColor={palette[0]} stopOpacity="0" /></radialGradient>
          <filter id={`grain-${node.id}`}><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={seed % 20} /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="table" tableValues="0 0.11" /></feComponentTransfer></filter>
        </defs>
        <rect width="1000" height="600" fill={`url(#bg-${node.id})`} /><ellipse cx="500" cy="330" rx="420" ry="245" fill={`url(#glow-${node.id})`} opacity="0.12" />
        {dust.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={point.r} fill="#fff" opacity={0.04 + (index % 5) * 0.02} />)}
        <path d="M80 560 L230 105 L770 105 L920 560 Z" fill="#050608" stroke="#20242a" strokeWidth="4" /><path d="M230 105 L770 105 L685 560 L315 560 Z" fill="#080a0d" stroke="#151a20" strokeWidth="3" />
        {(scene === "screen" || scene === "lobby") && <g><rect x="300" y="140" width="400" height="280" rx="12" fill="#020304" stroke="#333942" strokeWidth="9" /><rect x="325" y="165" width="350" height="230" fill={palette[1]} /><path d="M500 195 c-75 0 -110 80 -110 170 h220 c0 -90 -35 -170 -110 -170z" fill="#040507" /></g>}
        {(scene === "door" || scene === "hall") && <g><rect x="390" y="125" width="220" height="370" fill="#070707" stroke={palette[0]} strokeOpacity="0.55" strokeWidth="5" /><path d="M420 497 H580" stroke="#ffe6ad" strokeWidth="8" opacity="0.72" /><path d="M455 505 v40 M545 505 v40" stroke="#030405" strokeWidth="25" strokeLinecap="round" /></g>}
        {scene === "wall" && <g><path d="M350 115 L435 560 M650 115 L565 560" stroke="#272b30" strokeWidth="6" /><path d="M430 210 q70 -80 140 0 v230 q-70 55 -140 0z" fill="#020304" stroke={palette[0]} strokeOpacity="0.5" strokeWidth="4" /></g>}
        {scene === "stairs" && <g>{Array.from({length: 8}, (_, i) => <path key={i} d={`M${260+i*35} ${510-i*38} H${610+i*12}`} stroke="#363b40" strokeWidth="13" />)}<path d="M310 500 L650 135" stroke={palette[0]} strokeOpacity="0.45" strokeWidth="5" /></g>}
        {scene === "elevator" && <g><rect x="330" y="120" width="340" height="400" fill="#08090a" stroke="#4a4f55" strokeWidth="8" /><path d="M500 120 V520" stroke="#34393e" strokeWidth="5" /><text x="475" y="95" fill={palette[0]} fontSize="38">-1</text></g>}
        {scene === "laundry" && <g><circle cx="410" cy="320" r="105" fill="#070809" stroke="#4a5056" strokeWidth="12" /><circle cx="590" cy="320" r="105" fill="#070809" stroke="#4a5056" strokeWidth="12" /><path d="M350 320 q60 -80 120 0 q-60 80 -120 0" fill="none" stroke={palette[0]} strokeWidth="7" opacity="0.55" /></g>}
        {scene === "pipes" && <g><path d="M220 160 H760 M280 110 V540 M710 110 V540" stroke="#464b50" strokeWidth="26" /><path d="M220 300 H760" stroke={palette[0]} strokeOpacity="0.4" strokeWidth="15" /></g>}
        {scene === "roof" && <g><path d="M80 450 L250 300 L410 390 L590 260 L760 390 L920 280 L920 560 L80 560Z" fill="#030405" /><rect x="440" y="170" width="120" height="230" fill="#08090a" stroke="#3a3f45" strokeWidth="6" /></g>}
        {scene === "street" && <g><path d="M110 470 H890" stroke="#373c41" strokeWidth="16" /><path d="M500 120 V480" stroke="#20252a" strokeWidth="8" /><rect x="440" y="130" width="120" height="50" fill={palette[0]} opacity="0.55" /></g>}
        {thread === "reflection" && <g><circle cx="465" cy="325" r="7" fill={palette[0]} /><circle cx="535" cy="325" r="7" fill={palette[0]} /></g>}
        {thread === "threshold" && <path d="M500 190 C430 230 420 390 435 530 H565 C580 390 570 230 500 190Z" fill="#010203" opacity="0.9" />}
        {thread === "voice" && <g>{Array.from({length: 5}, (_, i) => <path key={i} d={`M${420-i*18} ${280+i*35} Q500 ${240+i*30} ${580+i*18} ${280+i*35}`} fill="none" stroke={palette[0]} strokeOpacity={0.65-i*0.08} strokeWidth="4" />)}</g>}
        {thread === "duplicate" && <g opacity="0.72"><path d="M445 520 C445 370 468 250 500 230 C532 250 555 370 555 520Z" fill="#010203" /><path d="M545 520 C545 390 568 280 600 260 C632 280 655 390 655 520Z" fill="#010203" /></g>}
        {thread === "erased" && <rect x="420" y="180" width="160" height="300" fill="#000" stroke={palette[0]} strokeDasharray="12 15" strokeWidth="4" />}
        <g className={secretClicks >= 6 ? "secret-eye awake" : "secret-eye"}><ellipse cx="855" cy="92" rx={secretClicks >= 6 ? "70" : "42"} ry={secretClicks >= 6 ? "28" : "10"} fill="#020304" stroke={palette[0]} strokeWidth="3" opacity="0.9" /><circle cx="855" cy="92" r={secretClicks >= 6 ? "15" : "6"} fill={palette[0]} /></g>
        <rect width="1000" height="600" filter={`url(#grain-${node.id})`} opacity="0.75" /><text x="32" y="48" fill="#fff" opacity="0.38" fontSize="17" letterSpacing="6">ECHOES // {node.id.toUpperCase()}</text>
      </svg><span className="art-hint">畫面右上角似乎有東西</span>
    </button>
  );
}

export default function Game() {
  const [world, setWorld] = useState(DEFAULT_WORLD);
  const [state, setState] = useState(createInitialState());
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(new Date());
  const [loops, setLoops] = useState(0);
  const [showRestart, setShowRestart] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [toast, setToast] = useState("");
  const [secretClicks, setSecretClicks] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const normalized = normalizeState(decodeState(readCookie(COOKIE_NAME) || ""));
    setState(normalized.state);
    setLoops(Number(readCookie(LOOP_COOKIE) || 0));
    if (normalized.migrated) setToast("舊版線性存檔已轉換：新故事從真正的分支樹重新開始，重啟次數仍保留。");
    fetch(`https://raw.githubusercontent.com/2lll5/Echoes-Beneath/main/public/story.generated.json?t=${Date.now()}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("world unavailable")))
      .then((data) => { if (data?.schemaVersion === 3 && Number.isInteger(data.releasedDepth)) setWorld(data); })
      .catch(() => setWorld(DEFAULT_WORLD)).finally(() => setReady(true));
  }, []);
  useEffect(() => { if (ready) writeCookie(COOKIE_NAME, encodeState(state)); }, [state, ready]);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    let idleTimer;
    const resetIdle = () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => setToast("你很久沒有移動。這條路線裡只有你停了下來。"), 22000); };
    const onVisibility = () => { if (document.hidden) document.title = "你離開了。這條分支沒有。"; else { document.title = "Echoes Beneath｜底下的回聲"; setToast("你回來了。所在地沒有改變，但某個物件的位置和剛才不同。"); } };
    ["mousemove", "keydown", "touchstart", "scroll"].forEach((event) => window.addEventListener(event, resetIdle, { passive: true })); document.addEventListener("visibilitychange", onVisibility); resetIdle();
    return () => { clearTimeout(idleTimer); ["mousemove", "keydown", "touchstart", "scroll"].forEach((event) => window.removeEventListener(event, resetIdle)); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 4600); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => () => { if (audioRef.current) audioRef.current.close(); }, []);

  const current = useMemo(() => getStoryNode(state, world), [state, world]);
  const route = getDominantRoute(state.stats), currentLocation = getLocation(state.context), currentThread = getThread(state.context);
  const pendingUnlocked = state.pending ? canEnterDepth(state.pending.depth, world) : false;
  const progress = Math.min(100, (state.depth / Math.max(Number(world.releasedDepth || 1), 1)) * 100);

  const toggleSound = async () => {
    if (soundOn) { if (audioRef.current) await audioRef.current.close(); audioRef.current = null; setSoundOn(false); return; }
    const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) return setToast("這個瀏覽器無法播放環境音。");
    const context = new AudioContext(), master = context.createGain(); master.gain.value = 0.025; master.connect(context.destination);
    [43, 57, 86].forEach((frequency, index) => { const oscillator = context.createOscillator(), gain = context.createGain(); oscillator.type = index === 2 ? "sine" : "triangle"; oscillator.frequency.value = frequency; gain.gain.value = index === 2 ? 0.16 : 0.32; oscillator.connect(gain).connect(master); oscillator.start(); });
    audioRef.current = context; setSoundOn(true); setToast("環境音已開啟。有些腳步只會在目前所在地出現。");
  };

  const choose = (choice, index) => {
    if (state.result || state.ending) return;
    if (!current.isFinal && !validateTransition(state.context, choice.nextContext)) return setToast("連貫性檢查阻止了一個不可能的場景跳轉。");
    const stats = { ...state.stats }; Object.entries(choice.effects || {}).forEach(([key, value]) => { stats[key] = (stats[key] || 0) + value; });
    const result = personalize(choice.result, now), nextLocation = choice.nextContext ? getLocation(choice.nextContext) : currentLocation;
    const historyEntry = { nodeKey: state.nodeKey, depth: state.depth, title: current.title, location: currentLocation.short, choiceId: choice.id, choiceIndex: index + 1, choiceLabel: choice.label, result, nextNodeKey: choice.nextNodeKey || null, nextLocation: nextLocation.short };
    setState((previous) => ({ ...previous, stats, flags: choice.flag ? [...new Set([...previous.flags, choice.flag])].slice(-80) : previous.flags, items: choice.item ? [...new Set([...previous.items, choice.item])].slice(-48) : previous.items, history: [...previous.history, historyEntry].slice(-80), result, pending: current.isFinal ? null : { nodeKey: choice.nextNodeKey, context: choice.nextContext, depth: previous.depth + 1, choiceId: choice.id }, ending: current.isFinal ? choice.ending : previous.ending }));
  };
  const advance = () => { if (!state.pending || !canEnterDepth(state.pending.depth, world)) return; setState((previous) => ({ ...previous, nodeKey: previous.pending.nodeKey, context: previous.pending.context, depth: previous.pending.depth, result: null, pending: null })); setSecretClicks(0); };
  const restart = () => { const nextLoops = loops + 1; writeCookie(LOOP_COOKIE, String(nextLoops)); setLoops(nextLoops); setState(createInitialState()); setShowRestart(false); setSecretClicks(0); setToast(nextLoops === 3 ? "第三次重來後，根節點多出一行字：它記得你曾選過另外兩條路。" : "分支樹已重置；世界仍保留你重來過的次數。"); };
  const inspectArt = () => { const next = secretClicks + 1; setSecretClicks(next); if (next === 3) setToast(`那不是裝飾。它剛才看向${currentLocation.short}的出口。`); if (next === 6) { setToast("彩蛋：獲得「拓撲之眼」，可以辨認故事交織的位置。"); setState((previous) => ({ ...previous, items: [...new Set([...previous.items, "拓撲之眼"])] })); } };
  const onPointerMove = (event) => { const x = (event.clientX / window.innerWidth - 0.5) * 2, y = (event.clientY / window.innerHeight - 0.5) * 2; event.currentTarget.style.setProperty("--mx", x.toFixed(3)); event.currentTarget.style.setProperty("--my", y.toFixed(3)); };

  if (!ready) return <main className="loading-screen"><div className="loader" /><p>正在確認這條路是否真的連得上下一個房間……</p></main>;

  return (
    <main className="game-shell" onPointerMove={onPointerMove}>
      <div className="noise" /><div className="watcher" aria-hidden="true"><i /><i /></div>
      <header className="topbar"><div><span className="eyebrow">BRANCHING HORROR GRAPH / COOKIE MEMORY</span><h1>Echoes Beneath <small>底下的回聲</small></h1></div><div className="header-actions"><button className="ghost-button" onClick={toggleSound}>{soundOn ? "關閉環境音" : "開啟環境音"}</button><button className="ghost-button" onClick={() => setShowArchive(true)}>分支路徑</button><button className="danger-button" onClick={() => setShowRestart(true)}>重新開始</button></div></header>
      <section className="presence-strip"><span className="live-dot" /><p>本地時間 <strong>{formatTime(now)}</strong> · 目前所在地：<strong>{currentLocation.short}</strong></p><span>已釋出深度 {world.releasedDepth} · 7/31 收尾</span></section>
      <section className="progress-wrap"><div className="progress-meta"><span>故事深度 {state.depth} / {world.releasedDepth} · 理論路徑 {theoreticalBranchCount(world.releasedDepth)}</span><span>{routeLabel(route)} · {currentThread.label}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></section>

      {state.ending ? <section className="ending-card"><span className="eyebrow">THE END REMEMBERS THE WHOLE PATH</span><h2>{currentLocation.short}終於安靜下來</h2><p>{state.result}</p><p className="ending-code">結局：{state.ending} · 經過 {state.history.length} 個節點 · 最後所在地：{currentLocation.short}</p><button className="danger-button solid" onClick={() => setShowRestart(true)}>回到根節點重新選擇</button></section> :
      <div className="game-grid"><section className="story-panel"><SceneArt node={current} secretClicks={secretClicks} onSecret={inspectArt} /><article className="story-card"><div className="chapter-line"><span>{current.isFinal ? "最終節點" : `故事節點 ${current.id}`}</span><span>{currentLocation.short} / {currentThread.label}</span></div><h2>{current.title}</h2><p className="subtitle">{current.subtitle}</p><p className="story-copy">{personalize(current.intro, now)}</p><div className="route-note"><span>這條路線的反應</span><p>{personalize(current.routeText?.[route] || current.routeText?.balanced, now)}</p></div>
        {!state.result ? <div className="choices">{current.choices.map((choice, index) => <button className="choice-card" key={`${current.id}-${choice.id}`} onClick={() => choose(choice, index)}><span className="choice-index">0{index + 1}</span><span className="choice-icon">{choice.icon}</span><span className="choice-label">{choice.label}</span><span className="choice-arrow">→</span></button>)}</div> :
        <div className="result-card"><span className="eyebrow">CHOICE STORED WITH ITS NEXT NODE</span><h3>這個選擇已經改變所在地與威脅</h3><p>{state.result}</p>{pendingUnlocked ? <button className="primary-button" onClick={advance}>進入「{getLocation(state.pending.context).short}」的下一個節點 <span>→</span></button> : <div className="locked-branch"><strong>這條分支尚未釋出下一層</strong><p>它不會被硬接回其他故事。GitHub Actions 會在整點增加新的可探索深度；你的選擇與下一個所在地已保存在 Cookie。</p><button className="ghost-button" onClick={() => location.reload()}>重新檢查整點更新</button></div>}</div>}
      </article></section><aside className="status-panel">
        <div className="status-card identity-card"><span className="eyebrow">SUBJECT</span><div className="avatar">Z<span>{loops || ""}</span></div><h3>{routeLabel(route)}</h3><p>走過 {state.history.length} 個節點 · 重啟 {loops} 次</p></div>
        <div className="status-card"><div className="status-heading"><h3>連貫性狀態</h3><span>決定下一幕</span></div><div className="continuity-list"><p><strong>所在地</strong><span>{currentLocation.label}</span></p><p><strong>危險來源</strong><span>{currentThread.entity}</span></p><p><strong>關係</strong><span>{state.context.relation}</span></p><p><strong>壓力</strong><span>{state.context.pressure} / 9</span></p></div></div>
        <div className="status-card"><div className="status-heading"><h3>心理輪廓</h3><span>改寫同一節點的觀察</span></div>{Object.entries(STAT_META).map(([key, meta]) => <div className="stat-row" key={key}><span>{meta.icon} {meta.label}</span><div className="stat-bar"><i style={{ width: `${Math.min(100, 18 + Math.max(0, state.stats[key]) * 7)}%` }} /></div><strong>{state.stats[key]}</strong></div>)}</div>
        <div className="status-card"><div className="status-heading"><h3>帶在身上的線索</h3><span>{state.items.length}</span></div><div className="item-list">{state.items.length ? state.items.slice(-7).map((item) => <span key={item}>{item}</span>) : <p>目前沒有任何線索能替你證明這條路。</p>}</div></div>
        <div className="status-card live-card"><span className="live-dot" /><div><strong>真正的故事圖</strong><p>每次選擇建立獨立下一節點；只有所在地、線索與威脅相容時才允許交織。</p></div></div>
      </aside></div>}
      <footer><span>存檔：Browser Cookie · Schema v3</span><span>已釋出深度：{world.releasedDepth} · 分支因子：3</span></footer>
      {showRestart && <div className="modal-backdrop" onClick={() => setShowRestart(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><span className="eyebrow">RESET THE ENTIRE GRAPH PATH</span><h2>確定回到根節點？</h2><p>目前走過的節點、所在地、心理數值與線索會清空；重啟次數保留，部分彩蛋會因此改變。</p><div className="modal-actions"><button className="ghost-button" onClick={() => setShowRestart(false)}>取消</button><button className="danger-button solid" onClick={restart}>清除這條路徑</button></div></div></div>}
      {showArchive && <div className="modal-backdrop" onClick={() => setShowArchive(false)}><div className="modal archive-modal" onClick={(event) => event.stopPropagation()}><span className="eyebrow">BRANCH PATH ARCHIVE</span><h2>你真正走過的路</h2><div className="archive-grid"><div><strong>{state.history.length}</strong><span>已走節點</span></div><div><strong>{state.flags.length}</strong><span>隱藏事件</span></div><div><strong>{loops}</strong><span>重啟次數</span></div></div><div className="path-list">{state.history.length ? state.history.slice(-14).map((entry, index) => <div key={`${entry.nodeKey}-${index}`}><span>{String(entry.depth + 1).padStart(2, "0")}</span><p><strong>{entry.location}</strong>－{entry.choiceLabel}<small>下一站：{entry.nextLocation}</small></p></div>) : <p>尚未離開根節點。</p>}</div><button className="primary-button" onClick={() => setShowArchive(false)}>回到目前節點</button></div></div>}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
