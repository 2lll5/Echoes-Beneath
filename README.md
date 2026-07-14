# Echoes Beneath｜近身恐怖網頁 RPG

一款會把玩家的本地時間、頁面停留與選擇痕跡寫進敘事的繁體中文恐怖 RPG。每幕固定三個選擇，結果會改變「鎮定、警覺、共感」、持有物、隱藏旗標與後續路線。

## 遊戲特色

- 每幕固定 3 個選擇，每個結果、數值與隱藏事件均不同
- 使用 Browser Cookie 保存進度、路線、物品、旗標與重啟次數
- 隨時重新開始；世界會記住玩家重啟過幾次
- 利用本地時間、頁面可見性、閒置與游標位置營造「正在身邊發生」的感覺
- 不要求定位、攝影機或麥克風權限
- 原創動態 SVG 場景插畫；另附 GPT Image 2 資產生成腳本與提示詞
- GitHub Actions 每小時執行 `scripts/generate-story.mjs`，持續新增故事至 2026-07-31 並產生最終章
- 網站直接讀取 GitHub 最新的 `public/story.generated.json`，玩家重新整理即可取得新章節

## 本機執行

```bash
npm install
npm run dev
```

## 測試整點故事生成器

```bash
STORY_NOW=2026-07-15T09:00:00+08:00 npm run story:generate
```

同一小時重複執行不會產生重複章節。2026-07-31 23:00（Asia/Taipei）會寫入結局並停止新增。

## GPT Image 2 圖像資產

`public/art/prompts.json` 保存一致的視覺規格。設定 `OPENAI_API_KEY` 後執行：

```bash
npm run art:generate
```

未提供金鑰時，網站仍會使用內建動態 SVG 插畫正常運作。

## 部署

專案使用 Next.js，可直接匯入 Vercel。GitHub Actions 更新故事 JSON 後，前端會從 GitHub Raw 讀取最新內容，不必等待 Vercel 重新建置。