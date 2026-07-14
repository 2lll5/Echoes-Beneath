"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const NAME_COOKIE = "echoes_beneath_player_name";
const MAX_NAME_LENGTH = 16;

function readCookie(name) {
  if (typeof document === "undefined") return "";
  const row = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.split("=").slice(1).join("=")) : "";
}

function writeCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function normalizeName(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function nameLength(value) {
  return Array.from(value).length;
}

function avatarText(value) {
  const characters = Array.from(value.trim()).slice(0, 2).join("");
  return characters ? characters.toUpperCase() : "?";
}

export default function PlayerIdentity({ children }) {
  const [playerName, setPlayerName] = useState("");
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [portalHost, setPortalHost] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = normalizeName(readCookie(NAME_COOKIE));
    setPlayerName(saved);
    setDraft(saved);
    setEditing(!saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return undefined;

    const syncIdentityCard = () => {
      const card = document.querySelector(".identity-card");
      const avatar = card?.querySelector(".avatar");
      if (!card || !avatar) return;

      let host = card.querySelector("[data-player-name-host]");
      if (!host) {
        host = document.createElement("div");
        host.dataset.playerNameHost = "true";
        avatar.insertAdjacentElement("afterend", host);
      }

      avatar.classList.add("named-avatar");
      avatar.dataset.playerInitial = avatarText(playerName);
      setPortalHost(host);
    };

    syncIdentityCard();
    const observer = new MutationObserver(syncIdentityCard);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [playerName, ready]);

  useEffect(() => {
    if (!editing) return undefined;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    const onKeyDown = (event) => {
      if (event.key === "Escape" && playerName) {
        setEditing(false);
        setDraft(playerName);
        setError("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [editing, playerName]);

  const saveName = (event) => {
    event.preventDefault();
    const nextName = normalizeName(draft);
    const length = nameLength(nextName);

    if (!nextName) {
      setError("請留下至少一個能被叫出的名字。");
      return;
    }
    if (length > MAX_NAME_LENGTH) {
      setError(`名字最多 ${MAX_NAME_LENGTH} 個字。`);
      return;
    }

    writeCookie(NAME_COOKIE, nextName);
    setPlayerName(nextName);
    setDraft(nextName);
    setEditing(false);
    setError("");
    window.__ECHOES_PLAYER_NAME__ = nextName;
    window.dispatchEvent(new CustomEvent("echoes:player-name", { detail: { name: nextName } }));
  };

  const startRename = () => {
    setDraft(playerName);
    setError("");
    setEditing(true);
  };

  return (
    <>
      {children}

      {portalHost && playerName && createPortal(
        <div className="player-name-display">
          <strong title={playerName}>{playerName}</strong>
          <button type="button" onClick={startRename}>重新命名</button>
        </div>,
        portalHost
      )}

      {ready && editing && createPortal(
        <div className="name-modal-backdrop" role="presentation">
          <form className="name-modal" onSubmit={saveName} aria-labelledby="player-name-title">
            <span className="eyebrow">THE SCREEN NEEDS A NAME</span>
            <h2 id="player-name-title">螢幕要怎麼稱呼你？</h2>
            <p>這個名字會留在目前瀏覽器的 Cookie 裡。重新開始故事不會清除它，而且房間裡的某些東西可能會學會叫你的名字。</p>
            <label htmlFor="player-name-input">玩家名稱</label>
            <input
              ref={inputRef}
              id="player-name-input"
              name="playerName"
              type="text"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (error) setError("");
              }}
              maxLength={24}
              autoComplete="nickname"
              placeholder="輸入 1～16 個字"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "player-name-error" : "player-name-help"}
            />
            <div className="name-field-meta">
              <small id="player-name-help">可使用中文、英文、數字與常見符號</small>
              <small>{nameLength(normalizeName(draft))} / {MAX_NAME_LENGTH}</small>
            </div>
            {error && <p className="name-error" id="player-name-error" role="alert">{error}</p>}
            <div className="name-modal-actions">
              {playerName && <button type="button" className="ghost-button" onClick={() => {
                setEditing(false);
                setDraft(playerName);
                setError("");
              }}>取消</button>}
              <button type="submit" className="danger-button solid">寫下名字</button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </>
  );
}
