// 支出データの型
export interface ExpenseRecord {
  timestamp: string;
  item: string;
  customDate: string | null;
  category: string;
  amount: number;
  individualBurden: string;
  expenseDate: string;
}

// 月別集計データ（支出のみ）
export interface MonthlyData {
  month: string;
  expense: number;
}

// カテゴリ別集計
export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// 前月比較データ
export interface MonthComparisonData {
  category: string;
  currentMonth: number;
  previousMonth: number;
  difference: number;
  percentChange: number;
}

// トレンドデータ
export interface TrendData {
  month: string;
  [category: string]: string | number;
}

// アプリの設定（収入シート名を削除）
export interface AppSettings {
  spreadsheetId: string;
  expenseSheetName: string;
}
