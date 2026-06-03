/**
 * 家計簿 CSV取込（突合）GAS
 * ───────────────────────────────────────────────
 * Googleフォームの回答スプレッドシートに常駐させ、カード／銀行のCSVを
 * 取り込んで「抜け漏れだけ」を追記する。二重計上を構造的に防ぐ。
 *
 * 対応CSV（自動判定）:
 *   - イオンゴールド・セレクト カード明細（Shift_JIS, 日付YYMMDD）
 *   - 銀行 普通預金 入出金履歴（Shift_JIS, Visaデビット等）
 *   - PayPayカード 明細（UTF-8, 日付yyyy/M/d）
 *
 * 仕組み:
 *   1) 取込済み台帳（指紋）… 同じCSVを再取込しても二重にならない
 *   2) 日付＋金額で既存（手入力含む）と突合 … 疑わしきは「保留」へ
 *   3) 銀行のカード引落集計行・ATM・入金は除外し「除外ログ」へ記録
 * ─────────────────────────────────────────────── */

// ===== 設定 =====================================================
const CONFIG = {
  // フォール回答シート（ダッシュボードが読むシート）
  RESPONSE_SHEET: '家計簿【支出】（回答）',

  // 回答シートの列インデックス（0始まり）。ダッシュボードの読み取りに合わせる。
  COL: {
    TIMESTAMP: 0,    // タイムスタンプ
    ITEM: 1,         // 項目（店名を入れる）
    CUSTOM_DATE: 2,  // 任意日付
    CATEGORY: 3,     // カテゴリ
    AMOUNT: 4,       // 金額
    BURDEN: 5,       // 個人負担
    EXPENSE_DATE: 6, // 支出日（集計に使われる）
    TAG: 7,          // 取込タグ（ダッシュボードは無視する列）
  },

  // ルールに当たらなかった時の既定カテゴリ
  // ※ダッシュボードのカテゴリ別集計に出すには 01〜14 のいずれかに直す必要あり
  FALLBACK_CATEGORY: '未分類',

  // 補助シート名
  SHEET: {
    RULES: '取込ルール',       // キーワード → カテゴリ
    EXCLUDE: '除外ルール',     // 銀行摘要の除外キーワード
    LEDGER: '取込済み台帳',     // 指紋
    PENDING: '保留',           // 要確認（承認待ち）
    EXLOG: '除外ログ',         // 除外した行の記録（取りこぼし監査用）
    FIXED: '定期費マスター',    // 口座振替などの固定費
  },
};

// ===== メニュー =================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📥 家計簿取込')
    .addItem('CSVを取り込む…', 'showUploadDialog')
    .addItem('保留の承認分を反映', 'approvePending')
    .addSeparator()
    .addItem('定期費を今月分追加', 'addMonthlyFixed')
    .addSeparator()
    .addItem('初期セットアップ（シート作成）', 'setup')
    .addToUi();
}

// ===== 初期セットアップ ==========================================
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet(ss, CONFIG.SHEET.RULES, ['キーワード（店名に含む）', 'カテゴリ'], seedRules());
  ensureSheet(ss, CONFIG.SHEET.EXCLUDE, ['除外キーワード（銀行摘要に含む）'], seedExcludes());
  ensureSheet(ss, CONFIG.SHEET.LEDGER, ['指紋', '取込日時', 'ソース', '利用日', '店名', '金額']);
  ensureSheet(ss, CONFIG.SHEET.PENDING, ['承認', 'ソース', '利用日', '店名', '金額', 'カテゴリ', '理由', '指紋']);
  ensureSheet(ss, CONFIG.SHEET.EXLOG, ['記録日時', 'ソース', '利用日', '摘要', '金額', '除外理由']);
  ensureSheet(ss, CONFIG.SHEET.FIXED, ['有効', '項目', 'カテゴリ', '金額', '計上日(1-31)'], seedFixed());

  // 保留シートのA列をチェックボックスに
  const pend = ss.getSheetByName(CONFIG.SHEET.PENDING);
  pend.getRange('A2:A1000').insertCheckboxes();

  SpreadsheetApp.getUi().alert('セットアップ完了。補助シートを作成しました。\n「取込ルール」「除外ルール」「定期費マスター」を必要に応じて編集してください。');
}

function ensureSheet(ss, name, header, seedRows) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sh.setFrozenRows(1);
    if (seedRows && seedRows.length) {
      sh.getRange(2, 1, seedRows.length, seedRows[0].length).setValues(seedRows);
    }
  }
  return sh;
}

// ===== アップロードダイアログ ====================================
function showUploadDialog() {
  const html = HtmlService.createHtmlOutputFromFile('Upload')
    .setWidth(420).setHeight(260);
  SpreadsheetApp.getUi().showModalDialog(html, 'CSVを取り込む');
}

/**
 * HTMLから呼ばれる。base64のCSVを受け取り取込。
 * @return {string} 結果サマリー
 */
function processCsv(base64, filename) {
  const bytes = Utilities.base64Decode(base64);
  const text = decodeSmart(bytes);
  const source = detectSource(text, filename);
  if (!source) throw new Error('CSVの種類を判定できませんでした: ' + filename);

  const records = parseBySource(source, text); // {source, date:'yyyy/MM/dd', store, amount, kind}
  return reconcile(records, source);
}

// ===== 文字コード判定 ===========================================
function decodeSmart(bytes) {
  const blob = Utilities.newBlob(bytes);
  const utf8 = blob.getDataAsString('UTF-8');
  // UTF-8として妥当（PayPay等）ならそのまま
  if (utf8.indexOf('利用店名') >= 0 || utf8.indexOf('利用日') >= 0 && utf8.indexOf('�') < 0) {
    if (utf8.indexOf('�') < 0) return utf8;
  }
  // それ以外は Shift_JIS とみなす
  return Utilities.newBlob(bytes).getDataAsString('Shift_JIS');
}

// ===== ソース判定 ===============================================
function detectSource(text, filename) {
  if (text.indexOf('利用店名・商品名') >= 0) return 'paypay';
  if (text.indexOf('ご利用カード') >= 0 || text.indexOf('利用者区分') >= 0) return 'aeon';
  if (text.indexOf('摘要') >= 0 && text.indexOf('引出') >= 0) return 'bank';
  return null;
}

// ===== パーサ（ソース別） =======================================
function parseBySource(source, text) {
  const rows = Utilities.parseCsv(text);
  if (source === 'paypay') return parsePaypay(rows);
  if (source === 'aeon') return parseAeon(rows);
  if (source === 'bank') return parseBank(rows);
  return [];
}

// PayPayカード明細（UTF-8）
function parsePaypay(rows) {
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 6) continue;
    const date = toYmd(r[0]);
    const amount = toNum(r[5]);
    if (!date || !amount) continue;
    out.push({ source: 'PayPay', date: date, store: clean(r[1]), amount: amount, kind: 'expense' });
  }
  return out;
}

// イオンカード明細（Shift_JIS, 日付YYMMDD, 金額=7列目）
function parseAeon(rows) {
  const out = [];
  let started = false;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    if (!started) {
      if (String(r[0]).indexOf('ご利用日') >= 0) started = true;
      continue;
    }
    const c0 = String(r[0] || '').trim();
    if (!/^\d{6}$/.test(c0)) continue; // データ行はYYMMDDの6桁
    const date = ymdFromYYMMDD(c0);
    const amount = toNum(r[6]);
    if (!date || !amount) continue;
    out.push({ source: 'イオン', date: date, store: clean(r[2]), amount: amount, kind: 'expense' });
  }
  return out;
}

// 銀行 入出金履歴（Shift_JIS）
function parseBank(rows) {
  const out = [];
  const excludes = readExcludeKeywords();

  // 1パス目: 入金（預入額）を日付＋金額で集計 → 同日同額の引出を「返金相殺」として除外するため
  const depositKeys = {};
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 6) continue;
    const date = toYmd(r[0]);
    const deposit = toNum(r[4]);
    if (date && deposit) {
      const k = date + '|' + deposit;
      depositKeys[k] = (depositKeys[k] || 0) + 1;
    }
  }

  // 2パス目: 分類
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 6) continue;
    const date = toYmd(r[0]);
    if (!date) continue;
    const memo = clean(r[1]);
    const deposit = toNum(r[4]); // 預入額
    const withdraw = toNum(r[5]); // 引出額
    if (deposit) { // 入金・返金は除外（記録のみ）
      out.push({ source: '銀行', date: date, store: memo, amount: deposit, kind: 'exclude', reason: '入金/返金' });
      continue;
    }
    if (!withdraw) continue;
    // 同日同額の入金がある引出 → 返金で相殺とみなし除外
    const k = date + '|' + withdraw;
    if ((depositKeys[k] || 0) > 0) {
      depositKeys[k]--;
      out.push({ source: '銀行', date: date, store: memo, amount: withdraw, kind: 'exclude', reason: '返金相殺' });
      continue;
    }
    // 除外キーワード（カード引落集計・ATM・振込など）
    const hit = excludes.find(k2 => k2 && memo.indexOf(k2) >= 0);
    if (hit) {
      out.push({ source: '銀行', date: date, store: memo, amount: withdraw, kind: 'exclude', reason: '除外:' + hit });
      continue;
    }
    out.push({ source: '銀行', date: date, store: memo, amount: withdraw, kind: 'expense' });
  }
  return out;
}

// ===== 突合・追記の中核 =========================================
function reconcile(records, source) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const resp = ss.getSheetByName(CONFIG.RESPONSE_SHEET);
  if (!resp) throw new Error('回答シートが見つかりません: ' + CONFIG.RESPONSE_SHEET);

  const ledger = readLedgerSet();           // 既取込の指紋
  const existing = buildExistingMultiset(resp); // 既存(手入力含む)の「日付|金額」件数
  const rules = readRules();

  const toAppend = [];   // 自動追記
  const toPending = [];  // 保留
  const toExlog = [];    // 除外ログ
  const occCounter = {}; // ファイル内の同一行カウント（指紋安定化）

  let dup = 0;
  records.forEach(rec => {
    if (rec.kind === 'exclude') {
      toExlog.push([new Date(), rec.source, rec.date, rec.store, rec.amount, rec.reason || '除外']);
      return;
    }
    const base = [rec.source, rec.date, rec.amount, rec.store].join('|');
    occCounter[base] = (occCounter[base] || 0) + 1;
    const fp = md5(base + '|' + occCounter[base]);

    if (ledger.has(fp)) { dup++; return; } // 取込済み → 無視

    const key = rec.date + '|' + rec.amount;
    if ((existing[key] || 0) > 0) {
      existing[key]--; // 手入力済みの可能性 → 保留
      const cat = resolveCategory(rec.store, rules);
      toPending.push([false, rec.source, rec.date, rec.store, rec.amount, cat, '既存に同日同額あり（手入力済みの可能性）', fp]);
    } else {
      const cat = resolveCategory(rec.store, rules);
      toAppend.push({ rec: rec, cat: cat, fp: fp });
    }
  });

  // 自動追記を実行
  appendExpenses(resp, toAppend);
  appendLedger(toAppend.map(a => [a.fp, new Date(), a.rec.source, a.rec.date, a.rec.store, a.rec.amount]));
  appendRows(CONFIG.SHEET.PENDING, toPending);
  appendRows(CONFIG.SHEET.EXLOG, toExlog);

  return [
    'ソース: ' + source,
    '自動追記: ' + toAppend.length + ' 件',
    '保留(要確認): ' + toPending.length + ' 件',
    '除外: ' + toExlog.length + ' 件',
    '取込済みスキップ: ' + dup + ' 件',
  ].join('\n');
}

// 保留の承認分を回答シートへ反映
function approvePending() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pend = ss.getSheetByName(CONFIG.SHEET.PENDING);
  const resp = ss.getSheetByName(CONFIG.RESPONSE_SHEET);
  const last = pend.getLastRow();
  if (last < 2) { SpreadsheetApp.getUi().alert('保留はありません。'); return; }

  const data = pend.getRange(2, 1, last - 1, 8).getValues();
  const append = [];
  const ledger = [];
  const keepRows = [];
  data.forEach(row => {
    const [ok, src, date, store, amount, cat, , fp] = row;
    if (ok === true) {
      append.push({ rec: { source: src, date: date, store: store, amount: amount }, cat: cat || CONFIG.FALLBACK_CATEGORY, fp: fp });
      ledger.push([fp, new Date(), src, date, store, amount]);
    } else {
      keepRows.push(row);
    }
  });
  if (!append.length) { SpreadsheetApp.getUi().alert('承認（チェック）された行がありません。'); return; }

  appendExpenses(resp, append);
  appendLedger(ledger);

  // 承認済みを保留から除去（未承認だけ残す）
  pend.getRange(2, 1, last - 1, 8).clearContent();
  if (keepRows.length) pend.getRange(2, 1, keepRows.length, 8).setValues(keepRows);
  pend.getRange('A2:A1000').insertCheckboxes();

  SpreadsheetApp.getUi().alert(append.length + ' 件を回答シートへ反映しました。');
}

// 定期費（口座振替などの固定費）を今月分追記
function addMonthlyFixed() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const fixed = ss.getSheetByName(CONFIG.SHEET.FIXED);
  const resp = ss.getSheetByName(CONFIG.RESPONSE_SHEET);
  const last = fixed.getLastRow();
  if (last < 2) { SpreadsheetApp.getUi().alert('定期費マスターが空です。'); return; }

  const ledger = readLedgerSet();
  const rows = fixed.getRange(2, 1, last - 1, 5).getValues();
  const now = new Date();
  const ym = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM');
  const append = [];
  const ledRows = [];

  rows.forEach(([enabled, item, cat, amount, day]) => {
    if (enabled !== true || !item || !amount) return;
    const d = Math.min(Math.max(parseInt(day) || 1, 1), 28);
    const date = ym + '/' + ('0' + d).slice(-2);
    const fp = md5(['FIXED', ym, item, amount].join('|'));
    if (ledger.has(fp)) return; // 今月分は追記済み
    append.push({ rec: { source: '定期費', date: date, store: item, amount: amount }, cat: cat || CONFIG.FALLBACK_CATEGORY, fp: fp });
    ledRows.push([fp, new Date(), '定期費', date, item, amount]);
  });

  if (!append.length) { SpreadsheetApp.getUi().alert('今月分の定期費は追記済みです。'); return; }
  appendExpenses(resp, append);
  appendLedger(ledRows);
  SpreadsheetApp.getUi().alert(append.length + ' 件の定期費を追記しました。');
}

// ===== 書き込みヘルパ ===========================================
function appendExpenses(resp, items) {
  if (!items.length) return;
  const width = CONFIG.COL.TAG + 1;
  const values = items.map(({ rec, cat }) => {
    const row = new Array(width).fill('');
    row[CONFIG.COL.TIMESTAMP] = new Date();
    row[CONFIG.COL.ITEM] = rec.store;
    row[CONFIG.COL.CATEGORY] = cat;
    row[CONFIG.COL.AMOUNT] = rec.amount;
    row[CONFIG.COL.EXPENSE_DATE] = ymdToDate(rec.date); // 支出日（Date型）
    row[CONFIG.COL.TAG] = '自動取込:' + rec.source;
    return row;
  });
  resp.getRange(resp.getLastRow() + 1, 1, values.length, width).setValues(values);
}

function appendLedger(rows) {
  if (!rows.length) return;
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET.LEDGER);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function appendRows(sheetName, rows) {
  if (!rows.length) return;
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

// ===== 読み取りヘルパ ===========================================
function readLedgerSet() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET.LEDGER);
  const last = sh.getLastRow();
  const set = new Set();
  if (last < 2) return set;
  sh.getRange(2, 1, last - 1, 1).getValues().forEach(r => { if (r[0]) set.add(String(r[0])); });
  return set;
}

function buildExistingMultiset(resp) {
  const last = resp.getLastRow();
  const map = {};
  if (last < 2) return map;
  const width = CONFIG.COL.EXPENSE_DATE + 1;
  const data = resp.getRange(2, 1, last - 1, width).getValues();
  data.forEach(row => {
    const date = normalizeYmd(row[CONFIG.COL.EXPENSE_DATE]) || normalizeYmd(row[CONFIG.COL.CUSTOM_DATE]) || normalizeYmd(row[CONFIG.COL.TIMESTAMP]);
    const amount = toNum(row[CONFIG.COL.AMOUNT]);
    if (!date || !amount) return;
    const key = date + '|' + amount;
    map[key] = (map[key] || 0) + 1;
  });
  return map;
}

function readRules() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET.RULES);
  const last = sh ? sh.getLastRow() : 0;
  if (!sh || last < 2) return [];
  return sh.getRange(2, 1, last - 1, 2).getValues()
    .filter(r => r[0] && r[1])
    .map(r => ({ kw: String(r[0]), cat: String(r[1]) }));
}

function readExcludeKeywords() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET.EXCLUDE);
  const last = sh ? sh.getLastRow() : 0;
  if (!sh || last < 2) return seedExcludes().map(r => r[0]);
  return sh.getRange(2, 1, last - 1, 1).getValues().map(r => String(r[0])).filter(Boolean);
}

function resolveCategory(store, rules) {
  const s = String(store || '');
  for (const r of rules) { if (s.indexOf(r.kw) >= 0) return r.cat; }
  return CONFIG.FALLBACK_CATEGORY;
}

// ===== 値ユーティリティ =========================================
function clean(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }
function toNum(v) {
  if (v == null || v === '') return 0;
  const n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : Math.round(n);
}
function md5(s) {
  const d = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, s, Utilities.Charset.UTF_8);
  return d.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}
// "2026/4/1" "2026-4-1" "2026年5月1日" → "yyyy/MM/dd"
function toYmd(v) {
  const s = String(v || '').trim();
  let m = s.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!m) return '';
  return m[1] + '/' + ('0' + m[2]).slice(-2) + '/' + ('0' + m[3]).slice(-2);
}
// "260320"(YYMMDD) → "2026/03/20"
function ymdFromYYMMDD(s) {
  const y = 2000 + parseInt(s.substr(0, 2), 10);
  return y + '/' + s.substr(2, 2) + '/' + s.substr(4, 2);
}
// Dateオブジェクト or 文字列 → "yyyy/MM/dd"
function normalizeYmd(v) {
  if (v == null || v === '') return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, 'Asia/Tokyo', 'yyyy/MM/dd');
  }
  return toYmd(v);
}
// "yyyy/MM/dd"（文字列） or Date → Dateオブジェクト（支出日セル用）
function ymdToDate(v) {
  if (Object.prototype.toString.call(v) === '[object Date]') return v;
  const m = String(v || '').match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : v;
}

// ===== 初期シードデータ =========================================
function seedRules() {
  return [
    ['ＥＴＣ', '07 交通費・車両費'], ['本線', '07 交通費・車両費'], ['東名', '07 交通費・車両費'],
    ['接続', '07 交通費・車両費'], ['スマー', '07 交通費・車両費'], ['池尻', '07 交通費・車両費'],
    ['出光', '07 交通費・車両費'], ['ＥＮＥＯＳ', '07 交通費・車両費'], ['ガソリン', '07 交通費・車両費'],
    ['ドコモ', '04 通信費'], ['ｐｏｖｏ', '04 通信費'], ['povo', '04 通信費'], ['オプテージ', '04 通信費'],
    ['ｗｐＸ', '04 通信費'], ['さくら', '04 通信費'],
    ['ＯＰＥＮＡＩ', '04 通信費'], ['OPENAI', '04 通信費'], ['ＣＡＮＶＡ', '04 通信費'], ['Ｃａｎｖａ', '04 通信費'],
    ['ＣＬＡＵＤＥ', '04 通信費'], ['ＧＯＯＧＬＥ　ＰＬＡＹ', '04 通信費'], ['ＭＩＣＲＯＳＯＦＴ', '04 通信費'],
    ['伊豆新聞', '12 娯楽・交際費'],
    ['アマゾン', '02 生活品'], ['Ａｍａｚｏｎ', '02 生活品'], ['ＡＭＡＺＯＮ', '02 生活品'],
    ['電気', '03 光熱費'], ['でんき', '03 光熱費'], ['電力', '03 光熱費'], ['ガス', '03 光熱費'], ['水道', '03 光熱費'],
    ['保険', '13 保険料'],
    ['病院', '11 医療費'], ['クリニック', '11 医療費'], ['薬局', '11 医療費'], ['ドラッグ', '11 医療費'],
    ['スーパー', '01 食費'], ['マート', '01 食費'],
  ];
}
function seedExcludes() {
  // 銀行摘要にこれを含む引出は「支出取込」から除外（明細CSV側で取り込む／非支出）
  return [
    ['ＰａｙＰａｙカード'], ['PayPayカード'], ['ペイペイ'],
    ['イオン'], ['ＡＥＯＮ'],
    ['ＡＴＭ'], ['ATM'], ['カード　セブン'], ['セブン銀行'],
    ['振込'], ['口座振替手数料'],
  ];
}
function seedFixed() {
  // 有効, 項目, カテゴリ, 金額, 計上日 … 口座振替の固定費をここに登録
  return [
    [false, '家賃', '08 住宅ローン・家賃', 0, 27],
    [false, '生命保険', '13 保険料', 0, 27],
  ];
}
