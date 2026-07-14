"use client";

import { useEffect, useRef } from "react";

const MOBILE_QUERY = "(max-width: 700px)";

const MOBILE_OPENING = {
  title: "第一刻：手機前鏡頭裡多了一個人",
  subtitle: "凌晨的房間沒有開燈，唯一的亮光貼在你的掌心。",
  paragraphs: [
    "現在是 {{time}}。你側躺在床上滑手機，拇指剛離開螢幕，瀏覽器便自行跳到一個沒有網址的黑色頁面。頁面中央只有一句話：『請選擇你聽見聲音的位置。』",
    "手機明明開著靜音，底部喇叭卻傳出很輕的呼吸。你把音量按到最低，那道呼吸沒有變小，反而像有人把嘴貼近了收音孔。螢幕上方的綠色相機指示燈跟著亮起。",
    "前鏡頭畫面沒有自動開啟，但黑色玻璃仍映出你的臉。倒影的視線越過你的肩膀，看向床邊；下一秒，它先對鏡頭眨了一次眼。"
  ],
  choices: [
    "不抬頭，打開前鏡頭確認身後",
    "鎖上手機，退到房門旁查看通知聲",
    "開啟錄音，走到床頭牆邊收下呼吸"
  ],
  results: [
    "你點開前鏡頭。畫面裡的你仍躺在床上，身後卻站著另一個穿同樣睡衣的人。它彎下腰，把食指貼在鏡頭上，霧氣慢慢寫出『別看門』。你身後的床墊沒有下陷。",
    "你按下鎖定鍵，螢幕熄滅，門外卻立刻響起和手機相同的通知聲。你退到房門旁，看見門縫外站著一雙赤腳。那雙腳沒有影子，腳尖正慢慢轉向房間。",
    "你按下錄音，波形才跳動一下，手機便用你的聲音播放出一句尚未錄下的話：『終於選到我了。』你走到床頭牆邊，牆內隨即敲了三下，錄音長度卻顯示四秒。"
  ],
  hint: "手機前鏡頭裡似乎多了一個人"
};

function isRootScene() {
  const marker = document.querySelector(".chapter-line span:first-child");
  return Boolean(marker?.textContent?.includes("故事節點 root"));
}

export default function ResponsiveExperience({ children }) {
  const originalsRef = useRef(new Map());
  const selectedChoiceRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    let syncing = false;

    const rememberAndSet = (element, value) => {
      if (!element) return;
      if (!originalsRef.current.has(element)) originalsRef.current.set(element, element.textContent || "");
      if (element.textContent !== value) element.textContent = value;
    };

    const restoreOpening = () => {
      for (const [element, original] of originalsRef.current.entries()) {
        if (element.isConnected) element.textContent = original;
      }
      originalsRef.current.clear();
    };

    const sync = () => {
      if (syncing) return;
      syncing = true;

      const mobile = media.matches;
      const root = isRootScene();
      document.documentElement.dataset.echoesDevice = mobile ? "mobile" : "desktop";
      document.body.classList.toggle("mobile-opening", mobile && root);

      if (!root) {
        originalsRef.current.clear();
        selectedChoiceRef.current = null;
        syncing = false;
        return;
      }

      if (!mobile) {
        restoreOpening();
        syncing = false;
        return;
      }

      rememberAndSet(document.querySelector(".story-card h2"), MOBILE_OPENING.title);
      rememberAndSet(document.querySelector(".story-card .subtitle"), MOBILE_OPENING.subtitle);

      const paragraphs = document.querySelectorAll(".story-copy p");
      MOBILE_OPENING.paragraphs.forEach((text, index) => rememberAndSet(paragraphs[index], text));

      const labels = document.querySelectorAll(".choice-card .choice-label");
      MOBILE_OPENING.choices.forEach((text, index) => rememberAndSet(labels[index], text));
      rememberAndSet(document.querySelector(".art-hint"), MOBILE_OPENING.hint);

      const result = document.querySelector(".result-card > p");
      if (result && Number.isInteger(selectedChoiceRef.current)) {
        rememberAndSet(result, MOBILE_OPENING.results[selectedChoiceRef.current]);
      }

      syncing = false;
    };

    const captureChoice = (event) => {
      if (!media.matches || !isRootScene()) return;
      const card = event.target.closest?.(".choice-card");
      if (!card) return;
      const cards = Array.from(card.parentElement?.querySelectorAll(".choice-card") || []);
      const index = cards.indexOf(card);
      if (index >= 0 && index < MOBILE_OPENING.results.length) selectedChoiceRef.current = index;
    };

    const observer = new MutationObserver(() => window.requestAnimationFrame(sync));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    document.addEventListener("click", captureChoice, true);
    media.addEventListener?.("change", sync);
    window.addEventListener("orientationchange", sync);
    sync();

    return () => {
      observer.disconnect();
      document.removeEventListener("click", captureChoice, true);
      media.removeEventListener?.("change", sync);
      window.removeEventListener("orientationchange", sync);
      restoreOpening();
      document.body.classList.remove("mobile-opening");
      delete document.documentElement.dataset.echoesDevice;
    };
  }, []);

  return children;
}
