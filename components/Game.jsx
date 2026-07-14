"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CORE_STORY, STAT_META, getDominantRoute, routeLabel } from "../lib/story";

const COOKIE_NAME = "echoes_beneath_state";
const LOOP_COOKIE = "echoes_beneath_loops";
const INITIAL = {
  chapter: 0,
  choices: "",
  stats: { nerve: 0, insight: 0, empathy: 0 },
  flags: [],
  items: [],
  result: null,
  ending: null
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

function encodeState(value) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
  } catch {
    return "";
  }
}

function decodeState(value) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(value))));
  } catch {
    return null;
  }
}

function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function personalize(text, now) {
  return String(text || "")
    .replaceAll("{{time}}", formatTime(now))
    .replaceAll("{{hour}}", String(now.getHours()).padStart(2, "0"));
}

function SceneArt({ episode, secretClicks, onSecret }) {
  const [imageFailed, setImageFailed] = useState(false);
  const palette = {
    red: ["#ff4b55", "#3c080d"],
    amber: ["#ffb03b", "#3c2106"],
    blue: ["#63b3ff", "#071f3c"],
    violet: ["#b58cff", "#24103f"],
    green: ["#75e5a1", "#0b3420"]
  }[episode.accent] || ["#ff4b55", "#3c080d"];

  const seed = [...episode.id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  const dust = useMemo(() => Array.from({ length: 34 }, (_, index) => ({
    x: (seed * (index + 13) * 17) % 1000,
    y: (seed * (index + 7) * 29) % 600,
    r: index % 7 === 0 ? 2.1 : 0.9
  })), [seed]);

  const generatedImage = `/art/${episode.id}.png`;
  if (!imageFailed) {
    return (
      <button className="art-button image-art" onClick={onSecret} aria-label="調查場景中的異常">
        <img src={generatedImage} alt={`${episode.title} 場景插畫`} onError={() => setImageFailed(true)} />
        <span className="art-hint">點擊畫面調查異常</span>
      </button>
    );
  }

  return (
    <button className="art-button" onClick={onSecret} aria-label="調查場景中的異常">
      <svg className="scene-art" viewBox="0 0 1000 600" role="img" aria-label={`${episode.scene} 動態恐怖場景`}>
        <defs>
          <linearGradient id={`bg-${episode.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#020304" />
            <stop offset="0.62" stopColor="#090b0f" />
            <stop offset="1" stopColor={palette[1]} />
          </linearGradient>
          <radialGradient id={`glow-${episode.id}`}>
            <stop offset="0" stopColor={palette[0]} stopOpacity="0.75" />
            <stop offset="1" stopColor={palette[0]} stopOpacity="0" />
          </radialGradient>
          <filter id={`blur-${episode.id}`}><feGaussianBlur stdDeviation="10" /></filter>
          <filter id={`grain-${episode.id}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={seed % 20} />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer><feFuncA type="table" tableValues="0 0.11" /></feComponentTransfer>
          </filter>
        </defs>
        <rect width="1000" height="600" fill={`url(#bg-${episode.id})`} />
        <ellipse cx="500" cy="340" rx="430" ry="250" fill={`url(#glow-${episode.id})`} opacity="0.16" filter={`url(#blur-${episode.id})`} />
        {dust.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={point.r} fill="#fff" opacity={0.05 + (index % 5) * 0.025} />)}

        <path d="M80 560 L230 105 L770 105 L920 560 Z" fill="#050608" stroke="#20242a" strokeWidth="4" />
        <path d="M230 105 L770 105 L685 560 L315 560 Z" fill="#080a0d" stroke="#151a20" strokeWidth="3" />
        <path d="M315 560 L410 340 L590 340 L685 560 Z" fill="#030405" opacity="0.92" />

        {episode.scene === "door" && <g><rect x="390" y="135" width="220" height="350" rx="4" fill="#0a0908" stroke={palette[0]} strokeOpacity="0.5" strokeWidth="4" /><circle cx="570" cy="318" r="7" fill={palette[0]} /><path d="M420 487 H580" stroke="#ffe6ad" strokeWidth="8" opacity="0.7" /><path d="M460 500 v35 M540 500 v35" stroke="#050505" strokeWidth="24" strokeLinecap="round" /></g>}
        {episode.scene === "photo" && <g transform="rotate(-2 500 300)"><rect x="320" y="140" width="360" height="300" fill="#d7d1c1" opacity="0.88" /><rect x="345" y="165" width="310" height="210" fill="#2b2e31" /><circle cx="415" cy="245" r="34" fill="#0b0c0d" /><circle cx="585" cy="245" r="34" fill="#0b0c0d" /><rect x="475" y="188" width="50" height="170" fill="#08090a" opacity="0.25" /><path d="M500 176 C430 205 420 300 395 350 M500 176 C570 205 580 300 605 350" fill="none" stroke={palette[0]} strokeOpacity="0.4" strokeWidth="9" /></g>}
        {episode.scene === "phone" && <g><rect x="380" y="145" width="240" height="380" rx="35" fill="#050608" stroke="#4b5159" strokeWidth="8" /><rect x="400" y="185" width="200" height="290" fill="#10161b" /><path d="M430 425 C500 350 570 425 570 425" fill="#020304" /><path d="M455 402 q45 -55 90 0" fill="none" stroke={palette[0]} strokeWidth="4" opacity="0.8" /><circle cx="475" cy="415" r="5" fill={palette[0]} /><circle cx="525" cy="415" r="5" fill={palette[0]} /></g>}
        {episode.scene === "wall" && <g><path d="M360 120 L440 560 M650 105 L565 560" stroke="#272b30" strokeWidth="6" /><path d="M430 250 q70 -95 140 0 v190 q-70 50 -140 0z" fill="#020304" stroke={palette[0]} strokeOpacity="0.45" strokeWidth="4" /><path d="M470 310 q30 -25 60 0" fill="none" stroke={palette[0]} strokeWidth="3" opacity="0.7" /></g>}
        {episode.scene === "screen" && <g><rect x="280" y="125" width="440" height="300" rx="12" fill="#020304" stroke="#323842" strokeWidth="10" /><rect x="305" y="150" width="390" height="250" fill={palette[1]} /><path d="M500 195 c-75 0 -110 80 -110 170 h220 c0 -90 -35 -170 -110 -170z" fill="#040507" /><circle cx="466" cy="278" r="7" fill={palette[0]} /><circle cx="534" cy="278" r="7" fill={palette[0]} /><path d="M460 335 q40 25 80 0" fill="none" stroke={palette[0]} strokeWidth="4" /></g>}
        {episode.scene === "clock" && <g><circle cx="500" cy="285" r="155" fill="#050608" stroke={palette[0]} strokeWidth="6" strokeOpacity="0.55" /><path d="M500 285 L500 170 M500 285 L585 335" stroke="#e9edf2" strokeWidth="8" strokeLinecap="round" /><circle cx="500" cy="285" r="11" fill={palette[0]} />{Array.from({length: 12}, (_, i) => <circle key={i} cx={500 + Math.sin(i * Math.PI / 6) * 125} cy={285 - Math.cos(i * Math.PI / 6) * 125} r="4" fill="#fff" opacity="0.6" />)}</g>}
        {(episode.scene === "room" || episode.scene === "hall") && <g><path d="M410 535 C410 390 445 260 500 245 C555 260 590 390 590 535 Z" fill="#020304" /><circle cx="472" cy="337" r="7" fill={palette[0]} opacity="0.75" /><circle cx="528" cy="337" r="7" fill={palette[0]} opacity="0.75" /><path d="M470 400 q30 17 60 0" fill="none" stroke={palette[0]} strokeWidth="3" opacity="0.65" /></g>}

        <g className={secretClicks >= 6 ? "secret-eye awake" : "secret-eye"}>
          <ellipse cx="855" cy="92" rx={secretClicks >= 6 ? "70" : "42"} ry={secretClicks >= 6 ? "28" : "10"} fill="#020304" stroke={palette[0]} strokeWidth="3" opacity="0.9" />
          <circle cx="855" cy="92" r={secretClicks >= 6 ? "15" : "6"} fill={palette[0]} />
        </g>
        <rect width="1000" height="600" filter={`url(#grain-${episode.id})`} opacity="0.75" />
        <text x="32" y="48" fill="#fff" opacity="0.38" fontSize="17" letterSpacing="7">ECHOES BENEATH // {episode.id.toUpperCase()}</text>
      </svg>
      <span className="art-hint">畫面右上角似乎有東西</span>
    </button>
  );
}

export default function Game() {
  const [generated, setGenerated] = useState([]);
  const [state, setState] = useState(INITIAL);
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
    const saved = decodeState(readCookie(COOKIE_NAME) || "");
    const loopCount = Number(readCookie(LOOP_COOKIE) || 0);
    if (saved?.stats && Number.isInteger(saved.chapter)) setState({ ...INITIAL, ...saved });
    setLoops(loopCount);
    fetch(`https://raw.githubusercontent.com/2lll5/Echoes-Beneath/main/public/story.generated.json?t=${Date.now()}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("story unavailable")))
      .then((data) => setGenerated(Array.isArray(data.episodes) ? data.episodes : []))
      .catch(() => setGenerated([]))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) writeCookie(COOKIE_NAME, encodeState(state));
  }, [state, ready]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let idleTimer;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setToast("你很久沒有移動。畫面裡的人影卻沒有停下。"), 22000);
    };
    const onVisibility = () => {
      if (document.hidden) document.title = "你離開了。它沒有。";
      else {
        document.title = "Echoes Beneath｜底下的回聲";
        setToast("你回來了。插畫裡有一個位置和剛才不一樣。");
      }
    };
    ["mousemove", "keydown", "touchstart", "scroll"].forEach((event) => window.addEventListener(event, resetIdle, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    resetIdle();
    return () => {
      clearTimeout(idleTimer);
      ["mousemove", "keydown", "touchstart", "scroll"].forEach((event) => window.removeEventListener(event, resetIdle));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => {
    if (audioRef.current) audioRef.current.close();
  }, []);

  const episodes = useMemo(() => [...CORE_STORY, ...generated], [generated]);
  const current = episodes[state.chapter];
  const route = getDominantRoute(state.stats);
  const isWaiting = ready && state.chapter >= episodes.length && !state.ending;

  const toggleSound = async () => {
    if (soundOn) {
      if (audioRef.current) await audioRef.current.close();
      audioRef.current = null;
      setSoundOn(false);
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return setToast("這個瀏覽器無法播放環境音。");
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = 0.025;
    master.connect(context.destination);
    [43, 57, 86].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 2 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 2 ? 0.16 : 0.32;
      oscillator.connect(gain).connect(master);
      oscillator.start();
    });
    audioRef.current = context;
    setSoundOn(true);
    setToast("環境音已開啟。請注意：有些聲音不一定來自網站。");
  };

  const choose = (choice, index) => {
    if (state.result) return;
    const stats = { ...state.stats };
    Object.entries(choice.effects || {}).forEach(([key, value]) => { stats[key] = (stats[key] || 0) + value; });
    setState((previous) => ({
      ...previous,
      choices: `${previous.choices}${index + 1}`,
      stats,
      flags: choice.flag ? [...new Set([...previous.flags, choice.flag])].slice(-48) : previous.flags,
      items: choice.item ? [...new Set([...previous.items, choice.item])].slice(-32) : previous.items,
      result: personalize(choice.result, now),
      ending: current?.isFinal ? (choice.ending || route) : previous.ending
    }));
  };

  const advance = () => setState((previous) => ({ ...previous, chapter: previous.chapter + 1, result: null }));

  const restart = () => {
    const nextLoops = loops + 1;
    writeCookie(LOOP_COOKIE, String(nextLoops));
    setLoops(nextLoops);
    setState(INITIAL);
    setShowRestart(false);
    setSecretClicks(0);
    setToast(nextLoops === 3 ? "第三次重來後，開場的呼吸聲知道你會選哪一個按鈕。" : "進度已重置。但某些東西沒有一起被清除。");
  };

  const inspectArt = () => {
    const next = secretClicks + 1;
    setSecretClicks(next);
    if (next === 3) setToast("那不是裝飾。它剛才閉上了一次。");
    if (next === 6) {
      setToast("彩蛋：你看得太久了。獲得「不眨眼的瞳孔」。");
      setState((previous) => ({ ...previous, items: [...new Set([...previous.items, "不眨眼的瞳孔"])] }));
    }
  };

  const onPointerMove = (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    event.currentTarget.style.setProperty("--mx", x.toFixed(3));
    event.currentTarget.style.setProperty("--my", y.toFixed(3));
  };

  if (!ready) return <main className="loading-screen"><div className="loader" /><p>正在確認房間裡是否只有你……</p></main>;

  return (
    <main className="game-shell" onPointerMove={onPointerMove}>
      <div className="noise" />
      <div className="watcher" aria-hidden="true"><i /><i /></div>
      <header className="topbar">
        <div><span className="eyebrow">LIVE HORROR RPG / COOKIE MEMORY</span><h1>Echoes Beneath <small>底下的回聲</small></h1></div>
        <div className="header-actions">
          <button className="ghost-button" onClick={toggleSound}>{soundOn ? "關閉環境音" : "開啟環境音"}</button>
          <button className="ghost-button" onClick={() => setShowArchive(true)}>選擇紀錄</button>
          <button className="danger-button" onClick={() => setShowRestart(true)}>重新開始</button>
        </div>
      </header>

      <section className="presence-strip">
        <span className="live-dot" />
        <p>本地時間 <strong>{formatTime(now)}</strong> · 頁面不會使用定位、攝影機或麥克風</p>
        <span>每小時新增 · 7/31 結局</span>
      </section>

      <section className="progress-wrap">
        <div className="progress-meta"><span>目前檔案 {Math.min(state.chapter + 1, Math.max(episodes.length, 1))} / {episodes.length}</span><span>{routeLabel(route)}</span></div>
        <div className="progress-track"><span style={{ width: `${Math.min(100, ((state.chapter + (state.result ? 0.5 : 0)) / Math.max(episodes.length, 1)) * 100)}%` }} /></div>
      </section>

      {state.ending ? (
        <section className="ending-card">
          <span className="eyebrow">THE END REMEMBERS YOU</span>
          <h2>結局已寫進你的 Cookie</h2>
          <p>{state.result}</p>
          <p className="ending-code">路線：{routeLabel(route)} · 選擇序列：{state.choices}</p>
          <button className="danger-button solid" onClick={() => setShowRestart(true)}>從第一夜重新開始</button>
        </section>
      ) : isWaiting ? (
        <section className="waiting-card">
          <div className="waiting-eye"><i /></div>
          <span className="eyebrow">THE NEXT HOUR HAS NOT ARRIVED</span>
          <h2>你已讀到目前最新的回聲</h2>
          <p>下一段故事會在下一次整點更新。進度已保存在 Cookie；重新整理後即可檢查新章節。</p>
          <button className="primary-button" onClick={() => location.reload()}>檢查新的聲音</button>
        </section>
      ) : current ? (
        <div className="game-grid">
          <section className="story-panel">
            <SceneArt episode={current} secretClicks={secretClicks} onSecret={inspectArt} />
            <article className="story-card">
              <div className="chapter-line"><span>{current.releaseAt ? `整點檔案 ${current.releaseAt}` : "初始檔案"}</span><span>{routeLabel(route)}</span></div>
              <h2>{current.title}</h2>
              <p className="subtitle">{current.subtitle}</p>
              <p className="story-copy">{personalize(current.intro, now)}</p>
              <div className="route-note"><span>它對你的判斷</span><p>{personalize(current.routeText?.[route] || current.routeText?.balanced, now)}</p></div>

              {!state.result ? (
                <div className="choices">
                  {current.choices.map((choice, index) => (
                    <button className="choice-card" key={`${current.id}-${index}`} onClick={() => choose(choice, index)}>
                      <span className="choice-index">0{index + 1}</span><span className="choice-icon">{choice.icon}</span><span className="choice-label">{choice.label}</span><span className="choice-arrow">→</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="result-card">
                  <span className="eyebrow">CHOICE STORED IN COOKIE</span><h3>你的選擇被記住了</h3><p>{state.result}</p>
                  {current.isFinal ? <button className="primary-button" onClick={() => setState((previous) => ({ ...previous, ending: previous.ending || route }))}>確認結局</button> : <button className="primary-button" onClick={advance}>前往下一段回聲 <span>→</span></button>}
                </div>
              )}
            </article>
          </section>

          <aside className="status-panel">
            <div className="status-card identity-card"><span className="eyebrow">SUBJECT</span><div className="avatar">Z<span>{loops || ""}</span></div><h3>{routeLabel(route)}</h3><p>重啟 {loops} 次 · 已留下 {state.choices.length} 個選擇</p></div>
            <div className="status-card"><div className="status-heading"><h3>心理輪廓</h3><span>會改寫敘事</span></div>{Object.entries(STAT_META).map(([key, meta]) => <div className="stat-row" key={key}><span>{meta.icon} {meta.label}</span><div className="stat-bar"><i style={{ width: `${Math.min(100, 18 + Math.max(0, state.stats[key]) * 7)}%` }} /></div><strong>{state.stats[key]}</strong></div>)}</div>
            <div className="status-card"><div className="status-heading"><h3>帶在身上的東西</h3><span>{state.items.length}</span></div><div className="item-list">{state.items.length ? state.items.slice(-7).map((item) => <span key={item}>{item}</span>) : <p>目前沒有任何東西證明剛才發生過。</p>}</div></div>
            <div className="status-card live-card"><span className="live-dot" /><div><strong>故事仍在更新</strong><p>GitHub Actions 每小時寫入一段新故事，直到 7 月 31 日收尾。</p></div></div>
          </aside>
        </div>
      ) : null}

      <footer><span>存檔：Browser Cookie</span><span>故事版本：CORE + {generated.length}</span></footer>

      {showRestart && <div className="modal-backdrop" onClick={() => setShowRestart(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><span className="eyebrow">RESET MEMORY</span><h2>確定重新開始？</h2><p>選擇、能力、物品與目前結局會清空；重啟次數會被保留，部分彩蛋也會因此改變。</p><div className="modal-actions"><button className="ghost-button" onClick={() => setShowRestart(false)}>取消</button><button className="danger-button solid" onClick={restart}>清除並重來</button></div></div></div>}

      {showArchive && <div className="modal-backdrop" onClick={() => setShowArchive(false)}><div className="modal archive-modal" onClick={(event) => event.stopPropagation()}><span className="eyebrow">COOKIE ARCHIVE</span><h2>它記住的內容</h2><p>選擇序列：{state.choices || "尚未留下選擇"}</p><div className="archive-grid"><div><strong>{state.flags.length}</strong><span>隱藏事件</span></div><div><strong>{state.items.length}</strong><span>特殊物品</span></div><div><strong>{loops}</strong><span>重啟次數</span></div></div><div className="flag-list">{state.flags.length ? state.flags.map((flag) => <code key={flag}>{flag}</code>) : <span>尚未觸發隱藏事件。</span>}</div><button className="primary-button" onClick={() => setShowArchive(false)}>回到頁面</button></div></div>}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
