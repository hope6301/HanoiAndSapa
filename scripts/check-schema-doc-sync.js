#!/usr/bin/env node
// 非 AI 的機械檢查工具：抓 detail.html 用到的 lm.xxx 欄位，比對協作指南.md
// 有沒有文件化，抓出「程式碼在用、但沒被文件化」的欄位當警告。
//
// 這是 heuristic，不是完整的靜態分析，設計成跟既有的「同步後 Node 語法檢查」
// 那一步一起手動跑，不是自動擋 commit 的 CI gate。抓到的東西要人工複核。
//
// 背景：本專案曾經發生過 UI 先讀了一個 lm.xxx 欄位、但協作指南.md 沒同步定義
// 該欄位 txt 語法的落差（見 itinerary-content-schema skill）。這個工具是第二層
// 機械防護網，用來在協作者忘記讀 skill 的情況下，還有機會被抓到。
//
// 新專案複製這份腳本時，只要調整下面兩個路徑常數即可。

'use strict';
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const DETAIL_HTML_PATH = path.join(PROJECT_ROOT, 'detail.html');
const GUIDE_MD_PATH = path.join(PROJECT_ROOT, '協作指南.md');

// detail.html 裡的 lm 是直接從內容來源（例如 DAYS）來的原始物件，沒有經過
// 主頁面 renderVals() 那種衍生轉換，所以這裡抓到的欄位名稱基本上都該被文件化。
// 這份 denylist 是防呆用的，排除萬一程式碼裡出現的 JS 內建方法/屬性名稱。
const JS_BUILTIN_DENYLIST = new Set([
  'length', 'map', 'filter', 'slice', 'join', 'forEach', 'includes', 'split',
  'trim', 'replace', 'replaceAll', 'toString', 'hasOwnProperty', 'constructor',
  'valueOf', 'toLocaleString', 'concat', 'indexOf', 'lastIndexOf', 'some',
  'every', 'reduce', 'reduceRight', 'find', 'findIndex', 'push', 'pop', 'shift',
  'unshift', 'keys', 'values', 'entries', 'sort', 'reverse', 'flat', 'flatMap'
]);

function readFile(filePath, label) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.error(`[check-schema-doc-sync] 讀不到 ${label}: ${filePath}`);
    console.error(e.message);
    process.exit(2);
  }
}

function extractUsedFields(detailHtmlSrc) {
  const used = new Set();
  const re = /\blm\.([A-Za-z_$][A-Za-z0-9_$]*)/g;
  let m;
  while ((m = re.exec(detailHtmlSrc))) {
    const field = m[1];
    if (!JS_BUILTIN_DENYLIST.has(field)) used.add(field);
  }
  return used;
}

function extractDocumentedFields(guideMdSrc) {
  // 找「txt 檔案格式說明」下面第一個 fenced code block（判斷依據：內容裡同時
  // 出現 name: 和 type:，避免文件裡其他程式碼範例被誤抓）
  const fenceRe = /```([\s\S]*?)```/g;
  let block = null;
  let m;
  while ((m = fenceRe.exec(guideMdSrc))) {
    if (/^name(?:（[^）]*）)?:/m.test(m[1]) && /^type(?:（[^）]*）)?:/m.test(m[1])) {
      block = m[1];
      break;
    }
  }
  if (!block) {
    console.error('[check-schema-doc-sync] 在協作指南.md 裡找不到含 name:/type: 的格式說明區塊，無法比對');
    process.exit(2);
  }
  // 欄位名稱後面可能跟著一個全形括號簡短說明（例如 `mapName（地圖搜尋名）:`），
  // 那只是給人看的提示，不是欄位名稱的一部分，這裡要忽略掉。
  const documented = new Set();
  const fieldRe = /^([A-Za-z_$][A-Za-z0-9_$]*)(?:（[^）]*）)?:/gm;
  while ((m = fieldRe.exec(block))) documented.add(m[1]);
  return documented;
}

function main() {
  const detailHtmlSrc = readFile(DETAIL_HTML_PATH, 'detail.html');
  const guideMdSrc = readFile(GUIDE_MD_PATH, '協作指南.md');

  const used = extractUsedFields(detailHtmlSrc);
  const documented = extractDocumentedFields(guideMdSrc);

  const undocumented = [...used].filter((f) => !documented.has(f)).sort();

  console.log(`[check-schema-doc-sync] detail.html 用到 ${used.size} 個 lm.* 欄位，協作指南.md 文件化了 ${documented.size} 個欄位`);
  console.log(`  detail.html 用到: ${[...used].sort().join(', ')}`);
  console.log(`  協作指南.md 文件化: ${[...documented].sort().join(', ')}`);

  if (undocumented.length === 0) {
    console.log('[check-schema-doc-sync] ✅ 沒有發現未文件化的欄位');
    process.exit(0);
  }

  console.warn('[check-schema-doc-sync] ⚠️ 以下欄位在 detail.html 有用到，但協作指南.md 沒有文件化（heuristic，請人工複核，可能是誤報）：');
  for (const f of undocumented) console.warn(`  - lm.${f}`);
  console.warn('這代表使用者可能實際上填不出這個欄位的內容，參考 itinerary-content-schema skill 補齊 txt 語法與文件。');
  process.exit(1);
}

main();
