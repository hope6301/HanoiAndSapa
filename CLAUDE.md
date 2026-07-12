# CLAUDE.md

這是「河內＆沙壩五天行程」網頁專案。`index.html` 是單頁行程網站，行程資料以 JS 陣列 `DAYS` 的形式內嵌在 `<script type="text/x-dc">` 區塊中，由樣板（`<x-dc>` 內的結構）與 `Component` class 渲染成畫面。

## 硬性規則（務必遵守）

1. **`行程資料.txt` 是行程內容的唯一編輯來源。** 任何人要新增/刪除/修改行程，都是編輯這個 txt 檔，而不是直接手改 `index.html`。
2. **同步 txt → `index.html` 時，只能修改 `const DAYS = [...]` 這個常數的內容。** 禁止修改樣板 HTML、`THEMES`、`Component` class、`TYPE_COLOR`、任何 CSS/style，除非使用者明確要求調整外觀或互動邏輯。這是為了保證 UI/UX 規格在多次協作後維持一致。
3. 完整的 txt 格式規則、解析規則、資料驗證規則（如 `type` 限定值、單引號跳脫等）與新增/刪除/修改的操作步驟，請參考 [協作指南.md](協作指南.md)：
   - Part A 是給人看的操作規則
   - Part B 是 AI 同步資料時要遵守的規範
4. 同步完成後，用 Node 做語法檢查（把 `DAYS` 字串抽出並 `eval`，確認可解析、天數與景點數符合預期），並簡短回報這次變更了哪些天、哪些景點。
5. 每次異動 `index.html` 或 `行程資料.txt` 後，在 `異動紀錄.log`（本機交接筆記，不上 github，見 `.gitignore`）補上一行紀錄，格式為 `[日期] 檔案 — 異動內容摘要`。
6. 除非使用者明確要求，不要主動 `git commit` 或 `git push`。
