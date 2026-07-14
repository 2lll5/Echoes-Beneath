"use client";

import { useEffect, useRef } from "react";

const TITLES = {
  "倒影先行": ["倒影沒有跟上", "玻璃裡的人先到了", "鏡面少了一個你"],
  "門檻來客": ["門外的人換了位置", "門鎖剛被試過", "門縫下多了一雙腳"],
  "牆後回聲": ["牆裡的人叫對了名字", "回聲比你早開口", "聲音從錯的方向靠近"],
  "未選之人": ["另一個你先到一步", "兩串腳印碰上了", "沒選的路自己回來了"],
  "被刪掉的位置": ["第四個選項又出現了", "空白裡伸出一根手指", "不存在的位置有人坐著"]
};

const PLACES = {
  "書桌": ["滑鼠線", "螢幕底座", "杯底水痕"],
  "房門": ["鑰匙孔", "門鍊", "窺視孔"],
  "牆邊": ["牆紙裂縫", "鬆動插座", "床頭板"],
  "走廊": ["監視器鏡頭", "感應燈", "消防箱玻璃"],
  "樓梯間": ["防火門玻璃", "扶手灰塵", "緊急照明燈"],
  "電梯廳": ["樓層按鈕", "電梯門縫", "緊急通話孔"],
  "洗衣間": ["洗衣機圓窗", "排水孔", "投幣口"],
  "維修夾層": ["溫熱水管", "電線束", "檢修孔"],
  "一樓大廳": ["住戶信箱", "玻璃大門", "警衛桌電話"],
  "屋頂": ["水塔鐵梯", "避雷線", "生鏽欄杆"],
  "騎樓": ["店面玻璃", "閃爍招牌", "路口反光鏡"]
};

const SETUPS = [
  (item) => `把手機錄音貼上${item}，倒數十秒`,
  (item) => `在${item}前放一枚硬幣，測它會不會越線`,
  (item) => `關掉所有光，只看${item}的影子`,
  (item) => `故意背對${item}，改用前鏡頭監看`
];

const MOVES = [
  (target) => `把手機留在原地播放呼吸聲，趁機溜進${target}`,
  (target) => `等腳步越過門口，反向鑽進${target}`,
  (target) => `先把外套丟向另一側，再衝去${target}`,
  (target) => `用鏡頭盯著身後，倒退進${target}`
];

const CONTACTS = [
  (target, moves) => moves ? `故意叫錯它的名字，跟著糾正聲走向${target}` : "故意叫錯它的名字，等它出聲糾正",
  (target, moves) => moves ? `回撥不存在的電話，到${target}接聽` : "回撥不存在的電話，聽誰先接起",
  (target, moves) => moves ? `請牆後的人先走，隔十步追到${target}` : "播放上一段錄音，逼回聲接下一句",
  (target, moves) => moves ? `閉眼數到七，讓另一個你先進${target}` : "假裝按下第三個選項，等它露出手"
];

const SETUP_RESULTS = [
  (item) => `錄音還沒開始，波形就先拼出你的名字。${item}裡傳回第四下敲擊。`,
  (item) => `硬幣沒有倒，卻往你身後滑了半圈。${item}的影子多出一根手指。`,
  (item) => `燈熄滅後，只有${item}仍有倒影。倒影裡的你正看著另一個方向。`,
  (item) => `前鏡頭裡，${item}後方站著一個人。你回頭時，只剩溫熱的指印。`
];

const MOVE_RESULTS = [
  (target) => `假呼吸把它留在原地。你滑進${target}時，身後的手機忽然用你的聲音喊停。`,
  (target) => `腳步追錯方向。你進入${target}，門縫最後卡進一小片灰色衣角。`,
  (target) => `外套落地時，有東西撲了上去。你衝進${target}，聽見它發現受騙後笑了一聲。`,
  (target) => `你倒退進${target}。直到門快關上，鏡頭裡才出現一隻貼近的手。`
];

const CONTACT_RESULTS = [
  (target, moves) => moves ? `它立刻糾正你，聲音從${target}傳來。你趕到時，只剩一串剛停下的鞋印。` : "它立刻糾正你，還說出眼前的細節。它一直都在附近。",
  (target, moves) => moves ? `電話裡只有${target}的回音。你抵達時，通話時間已多了十四秒。` : "電話接通後，另一端先播放你幾秒後才會說出的第一句話。",
  (target, moves) => moves ? `牆後的腳步先走。你追到${target}，第九步時它忽然停下等你。` : "錄音播完後，回聲補上了一句原本不存在的回答。",
  (target, moves) => moves ? `數到七時，${target}的門先開了。另一個你走進去，卻把影子留給你。` : "你假裝做出選擇，黑暗裡果然伸出一隻手。"
];

const REACTIONS = {
  "不回頭的人": "你把退路記在心裡，手沒有離開能反擊的位置。",
  "看見細節的人": "你先看灰塵與門縫；現場至少有一樣東西說了謊。",
  "願意聽完的人": "那道聲音在發抖。你先分清它是在求救，還是在模仿。",
  "還沒被摸透的人": "你沒有照習慣行動。黑暗裡的呼吸停了一拍。"
};

function hash(text) {
  let value = 2166136261;
  for (const char of String(text)) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value >>> 0);
}

const pick = (list, seed, offset = 0) => list[(seed + offset * 7919) % list.length];
const splitSentences = (text) => String(text || "").match(/[^。！？]+[。！？]?/g) || [];
const clip = (text, max) => Array.from(String(text || "").trim()).length <= max ? String(text || "").trim() : `${Array.from(String(text || "").trim()).slice(0, max - 1).join("")}…`;
const first = (text, max = 54) => clip(splitSentences(text)[0] || text, max);
const last = (text, max = 44) => { const parts = splitSentences(text); return clip(parts[parts.length - 1] || text, max); };
const quote = (text) => clip(String(text || "").match(/[「『“\"]([^」』”\"]+)[」』”\"]/u)?.[1] || last(text, 30).replace(/[。！？]$/, ""), 30);

function original(element) {
  if (!element) return "";
  if (!element.dataset.narrativeOriginal) element.dataset.narrativeOriginal = element.textContent || "";
  return element.dataset.narrativeOriginal;
}

function setText(element, value) {
  if (!element) return;
  original(element);
  if (element.textContent !== value) element.textContent = value;
}

function identity() {
  const marker = document.querySelector(".chapter-line span:first-child")?.textContent || "";
  if (!marker.includes("故事節點") || marker.includes("故事節點 root")) return null;
  const [location = "走廊", threat = "未選之人"] = (document.querySelector(".chapter-line span:last-child")?.textContent || "").split(" / ");
  return { node: marker.replace("故事節點", "").trim(), location, threat };
}

function destination(label, fallback) {
  return String(label || "").match(/(?:前往|走到)(.+)$/)?.[1]?.trim() || fallback;
}

export default function NarrativeRefresh({ children }) {
  const nodeRef = useRef("");
  const selectedRef = useRef(null);
  const metaRef = useRef({});

  useEffect(() => {
    let syncing = false;

    const restoreVisibility = () => document.querySelectorAll("[data-narrative-hidden]").forEach((element) => {
      element.style.display = element.dataset.narrativeDisplay || "";
      delete element.dataset.narrativeHidden;
      delete element.dataset.narrativeDisplay;
    });

    const sync = () => {
      if (syncing) return;
      syncing = true;
      const current = identity();
      if (!current) {
        nodeRef.current = "";
        selectedRef.current = null;
        restoreVisibility();
        document.querySelector(".story-card")?.classList.remove("narrative-v2");
        syncing = false;
        return;
      }

      if (nodeRef.current !== current.node) {
        nodeRef.current = current.node;
        selectedRef.current = null;
        document.querySelectorAll("[data-narrative-original]").forEach((element) => delete element.dataset.narrativeOriginal);
      }

      const seed = hash(`${current.node}:${current.location}:${current.threat}`);
      const item = pick(PLACES[current.location] || PLACES["走廊"], seed, 1);
      const heading = document.querySelector(".story-card h2");
      const chapter = original(heading).match(/第\s*(\d+)\s*刻/)?.[1] || "--";
      document.querySelector(".story-card")?.classList.add("narrative-v2");
      setText(heading, `第 ${chapter} 刻：${pick(TITLES[current.threat] || TITLES["未選之人"], seed, 2)}`);
      setText(document.querySelector(".story-card .subtitle"), `${current.location}裡，${item}剛剛動了一下。`);

      const paragraphs = Array.from(document.querySelectorAll(".story-copy p"));
      if (paragraphs.length >= 3) {
        setText(paragraphs[0], last(original(paragraphs[0]), 46));
        setText(paragraphs[1], `${first(original(paragraphs[1]), 56)} 黑暗裡有人說：「${quote(original(paragraphs[2]))}」`);
        if (!paragraphs[2].dataset.narrativeHidden) {
          paragraphs[2].dataset.narrativeDisplay = paragraphs[2].style.display || "";
          paragraphs[2].dataset.narrativeHidden = "true";
          paragraphs[2].style.display = "none";
        }
      }

      const route = document.querySelector(".progress-meta span:last-child")?.textContent?.split(" · ")[0];
      if (REACTIONS[route]) setText(document.querySelector(".route-note p"), REACTIONS[route]);

      const labels = Array.from(document.querySelectorAll(".choice-card .choice-label"));
      if (labels.length === 3) {
        const raw = labels.map(original);
        const moveTarget = destination(raw[1], "下一個房間");
        const contactTarget = destination(raw[2], current.location);
        const contactMoves = contactTarget !== current.location;
        metaRef.current = { seed, item, moveTarget, contactTarget, contactMoves };
        setText(labels[0], pick(SETUPS, seed, 3)(item));
        setText(labels[1], pick(MOVES, seed, 4)(moveTarget));
        setText(labels[2], pick(CONTACTS, seed, 5)(contactTarget, contactMoves));
      }

      const result = document.querySelector(".result-card > p");
      if (result && Number.isInteger(selectedRef.current)) {
        const meta = metaRef.current;
        const text = selectedRef.current === 0
          ? pick(SETUP_RESULTS, meta.seed, 6)(meta.item)
          : selectedRef.current === 1
            ? pick(MOVE_RESULTS, meta.seed, 7)(meta.moveTarget)
            : pick(CONTACT_RESULTS, meta.seed, 8)(meta.contactTarget, meta.contactMoves);
        setText(result, text);
      }
      syncing = false;
    };

    const capture = (event) => {
      if (!identity()) return;
      const card = event.target.closest?.(".choice-card");
      if (!card) return;
      selectedRef.current = Array.from(card.parentElement?.querySelectorAll(".choice-card") || []).indexOf(card);
    };

    const observer = new MutationObserver(() => requestAnimationFrame(sync));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    document.addEventListener("click", capture, true);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("click", capture, true);
      restoreVisibility();
    };
  }, []);

  return children;
}
