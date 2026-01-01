import type { ExpenseRecord } from '../types';

// GoogleスプレッドシートのURLからIDを抽出
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// Google Sheets APIのURLを生成（公開スプレッドシート用）
function getSheetUrl(spreadsheetId: string, sheetName: string): string {
  const encodedSheetName = encodeURIComponent(sheetName);
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodedSheetName}`;
}

// レスポンスをパースしてJSONデータを抽出
function parseGoogleSheetsResponse(responseText: string): unknown[][] {
  const jsonMatch = responseText.match(/google\.visualization\.Query\.setResponse\((.+)\);?$/s);
  if (!jsonMatch) {
    throw new Error('Invalid response format from Google Sheets');
  }
  
  const data = JSON.parse(jsonMatch[1]);
  const rows: unknown[][] = [];
  
  if (data.table && data.table.rows) {
    for (const row of data.table.rows) {
      const rowData: unknown[] = [];
      if (row.c) {
        for (const cell of row.c) {
          rowData.push(cell?.v ?? null);
        }
      }
      rows.push(rowData);
    }
  }
  
  return rows;
}

// 日付文字列をパース
function parseDateValue(value: unknown): string {
  if (!value) return '';
  
  if (typeof value === 'string') {
    const dateMatch = value.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) + 1;
      const day = parseInt(dateMatch[3]);
      return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
    }
    return value;
  }
  
  return String(value);
}

// 支出データを取得
export async function fetchExpenseData(
  spreadsheetId: string,
  sheetName: string = '家計簿【支出】（回答）'
): Promise<ExpenseRecord[]> {
  const url = getSheetUrl(spreadsheetId, sheetName);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch expense data: ${response.statusText}`);
  }
  
  const text = await response.text();
  const rows = parseGoogleSheetsResponse(text);
  
  return rows.slice(1).map((row): ExpenseRecord => ({
    timestamp: parseDateValue(row[0]),
    item: String(row[1] ?? ''),
    customDate: row[2] ? parseDateValue(row[2]) : null,
    category: String(row[3] ?? ''),
    amount: Number(row[4]) || 0,
    individualBurden: String(row[5] ?? ''),
    expenseDate: parseDateValue(row[6]),
  })).filter(record => record.amount > 0);
}
