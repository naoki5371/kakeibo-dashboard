import type { ExpenseRecord, IncomeRecord } from '../types';

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
  // Google Sheetsのレスポンスは "google.visualization.Query.setResponse({...})" の形式
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

// 日付文字列をパース（Date(year, month, day)形式またはDate文字列）
function parseDateValue(value: unknown): string {
  if (!value) return '';
  
  if (typeof value === 'string') {
    // "Date(2024,0,15)" 形式をパース
    const dateMatch = value.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) + 1; // 0-indexed
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
  sheetName: string = '支出'
): Promise<ExpenseRecord[]> {
  const url = getSheetUrl(spreadsheetId, sheetName);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch expense data: ${response.statusText}`);
  }
  
  const text = await response.text();
  const rows = parseGoogleSheetsResponse(text);
  
  // 最初の行はヘッダーなのでスキップ
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

// 収入データを取得（エラー時は空配列を返す）
export async function fetchIncomeData(
  spreadsheetId: string,
  sheetName: string = '収入'
): Promise<IncomeRecord[]> {
  try {
    const url = getSheetUrl(spreadsheetId, sheetName);
    
    const response = await fetch(url);
    if (!response.ok) {
      // 404エラー（シートが見つからない）の場合は空配列を返す
      if (response.status === 404) {
        console.warn(`収入シート "${sheetName}" が見つかりません。収入データなしで続行します。`);
        return [];
      }
      throw new Error(`Failed to fetch income data: ${response.statusText}`);
    }
    
    const text = await response.text();
    const rows = parseGoogleSheetsResponse(text);
    
    // 最初の行はヘッダーなのでスキップ
    const records = rows.slice(1).map((row): IncomeRecord => ({
      timestamp: parseDateValue(row[0]),
      item: String(row[1] ?? ''),
      customDate: row[2] ? parseDateValue(row[2]) : null,
      category: String(row[3] ?? ''),
      amount: Number(row[4]) || 0,
      incomeDate: parseDateValue(row[5]),
    })).filter(record => record.amount > 0);
    
    return records;
  } catch (error) {
    // パースエラーなども含めて、エラーが発生した場合は空配列を返す
    console.warn('収入データの取得中にエラーが発生しました:', error);
    return [];
  }
}

