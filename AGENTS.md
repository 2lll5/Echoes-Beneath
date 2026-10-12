# Agent Instructions

## Google Drive Build 交付規範（所有 Agent 必須遵守）
- 此 Git Repo 專屬交付位置為 Google Drive `AI Project/Echoes-Beneath/`（資料夾名稱必須等同 Repository；AI Project ID: `1Yhfro6Ss5TSCXCVIZIHEu5h7V1gL8b27`）。不可在 `AI Project/` 根目錄散放 Build 或每次 Build 新增頂層版本資料夾。
- **最新完整、已測試可執行的 Build 直接放專案資料夾根目錄**，同時附 ZIP／安裝包、SHA-256、完整分卷與必要還原／使用說明；多平台最新版可並存。先驗證上傳後的檔名、parent、大小及校驗；缺 ZIP／分片、只有 SHA 等不完整版本不得取代前一完整最新版。
- **僅有重要功能、架構、相容性、美術里程碑差異才新增 `vX.Y.Z-說明/` 版本子資料夾**；普通舊 Build 移往 `歷史封存/`（不刪檔）。不要每次發布都新建版本資料夾。
- 新開發一定提交／推送 GitHub；昂貴 Actions 建置僅必要手動 `workflow_dispatch` 或正式 `release: published`，避免每次 push main 都觸發。每次交付回報 Drive 專案資料夾連結、版本、校驗檔與實測結果。
**English for Codex:** Current verified build(s) belong at `AI Project/Echoes-Beneath/`; milestone versions use `vX.Y.Z-description/`, routine old builds use `歷史封存/` non-destructively. Never promote incomplete uploads.
