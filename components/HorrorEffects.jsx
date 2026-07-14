"use client";

import { useEffect, useRef, useState } from "react";

const EFFECTS = [
  { name: "shiver", duration: 720 },
  { name: "misalign", duration: 1900 },
  { name: "ghost", duration: 1450 },
  { name: "breathe", duration: 2300 },
  { name: "scan", duration: 1750 },
  { name: "watch", duration: 2100 },
  { name: "dim", duration: 1250 },
  { name: "tilt", duration: 1650 }
];

const randomBetween = (minimum, maximum) =>
  Math.round(minimum + Math.random() * (maximum - minimum));

export default function HorrorEffects({ children }) {
  const [effect, setEffect] = useState("");
  const activeRef = useRef(false);
  const effectTimerRef = useRef(null);
  const scheduleTimerRef = useRef(null);
  const choiceTimerRef = useRef(null);
  const lastEffectRef = useRef("");
  const lastTriggeredAtRef = useRef(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stopped = false;

    const clearEffect = () => {
      window.clearTimeout(effectTimerRef.current);
      activeRef.current = false;
      setEffect("");
    };

    const isSafeToDisturb = () =>
      !stopped &&
      !document.hidden &&
      !reducedMotion.matches &&
      !activeRef.current &&
      !document.querySelector(".modal-backdrop") &&
      !document.querySelector(".name-modal-backdrop") &&
      Date.now() - lastTriggeredAtRef.current > 26000;

    const triggerEffect = ({ force = false } = {}) => {
      if (!isSafeToDisturb()) return false;
      if (!force && Math.random() > 0.56) return false;

      const candidates = EFFECTS.filter((item) => item.name !== lastEffectRef.current);
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      if (!selected) return false;

      activeRef.current = true;
      lastEffectRef.current = selected.name;
      lastTriggeredAtRef.current = Date.now();
      setEffect(selected.name);
      effectTimerRef.current = window.setTimeout(clearEffect, selected.duration);
      return true;
    };

    const scheduleAmbientEffect = (initial = false) => {
      window.clearTimeout(scheduleTimerRef.current);
      const delay = initial
        ? randomBetween(24000, 48000)
        : randomBetween(72000, 148000);

      scheduleTimerRef.current = window.setTimeout(() => {
        triggerEffect();
        scheduleAmbientEffect(false);
      }, delay);
    };

    let hadResultCard = Boolean(document.querySelector(".result-card"));
    const observer = new MutationObserver(() => {
      const hasResultCard = Boolean(document.querySelector(".result-card"));
      if (hasResultCard && !hadResultCard && Math.random() < 0.24) {
        window.clearTimeout(choiceTimerRef.current);
        choiceTimerRef.current = window.setTimeout(
          () => triggerEffect({ force: true }),
          randomBetween(650, 1450)
        );
      }
      hadResultCard = hasResultCard;
    });

    observer.observe(document.body, { childList: true, subtree: true });
    scheduleAmbientEffect(true);

    return () => {
      stopped = true;
      observer.disconnect();
      window.clearTimeout(effectTimerRef.current);
      window.clearTimeout(scheduleTimerRef.current);
      window.clearTimeout(choiceTimerRef.current);
    };
  }, []);

  return (
    <div className={`horror-fx${effect ? ` fx-${effect}` : ""}`} data-effect={effect || undefined}>
      {children}
      <div className="fx-vignette" aria-hidden="true" />
      <div className="fx-scanline" aria-hidden="true" />
      <div className="fx-afterimage" aria-hidden="true" />
    </div>
  );
}
