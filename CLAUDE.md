# CLAUDE.md

這是「河內＆沙壩五天行程」網頁專案。`index.html` 是單頁行程網站，行程資料以 JS 陣列 `DAYS` 的形式內嵌在 `<script type="text/x-dc">` 區塊中，由樣板（`<x-dc>` 內的結構）與 `Component` class 渲染成畫面。`detail.html` 是附屬的單一景點詳細頁（見規則 7）。

## 硬性規則（務必遵守）

1. **`行程資料.txt` 是行程內容的唯一編輯來源。** 任何人要新增/刪除/修改行程，都是編輯這個 txt 檔，而不是直接手改 `index.html`。
2. **同步 txt → `index.html` 時，只能修改 `const DAYS = [...]` 這個常數的內容。** 禁止修改樣板 HTML、`THEMES`、`Component` class、`TYPE_COLOR`、任何 CSS/style，除非使用者明確要求調整外觀或互動邏輯。這是為了保證 UI/UX 規格在多次協作後維持一致。
3. 完整的 txt 格式規則、解析規則、資料驗證規則（如 `type` 限定值、單引號跳脫、選填欄位 `fullDetail`/`hasDetailPage` 等）與新增/刪除/修改的操作步驟，請參考 [協作指南.md](協作指南.md)：
   - Part A 是給人看的操作規則
   - Part B 是 AI 同步資料時要遵守的規範
4. 同步完成後，用 Node 做語法檢查（把 `DAYS` 字串抽出並 `eval`，確認可解析、天數與景點數符合預期），並簡短回報這次變更了哪些天、哪些景點。
5. 每次異動 `index.html`、`detail.html` 或 `行程資料.txt` 後，在 `異動紀錄.log`（本機交接筆記，不上 github，見 `.gitignore`）補上一行紀錄，格式為 `[日期] 檔案 — 異動內容摘要`。
6. 除非使用者明確要求，不要主動 `git commit` 或 `git push`。
7. **`detail.html` 不能有自己的一份 `DAYS`/`THEMES`/`TYPE_COLOR`。** 它是用 `fetch('./index.html')` 在瀏覽器端讀回 `index.html` 原始碼、截出 `<script type="text/x-dc">` 裡 `class Component` 之前的常數宣告並執行取值，藉此跟 index.html 共用同一份資料與設計 token，不重複維護。修改 `index.html` 裡這幾個常數的宣告順序或位置時，要確認 `detail.html` 的擷取邏輯（[detail.html:21-32](detail.html#L21-L32)）還能正確截取。`detail.html` 需要透過 http(s) 開啟（本機起 server 或 GitHub Pages），直接用 `file://` 雙擊打開會被瀏覽器 CORS 擋掉 fetch。
8. **部署設定 [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 的複製清單必須包含 `detail.html`。** 如果以後又新增其他獨立頁面，也要記得一併加進去，否則 GitHub Pages 上會 404。
