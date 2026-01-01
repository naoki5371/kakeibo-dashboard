import { format, parse, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import type {
  ExpenseRecord,
  IncomeRecord,
  MonthlyData,
  CategoryData,
  MonthComparisonData,
  TrendData,
} from '../types';

// カテゴリごとの色を定義
const CATEGORY_COLORS: Record<string, string> = {
  '食費': '#FF6B6B',
  '日用品': '#4ECDC4',
  '交通費': '#45B7D1',
  '光熱費': '#96CEB4',
  '通信費': '#FFEAA7',
  '医療費': '#DDA0DD',
  '娯楽': '#98D8C8',
  '衣服': '#F7DC6F',
  '教育': '#BB8FCE',
  '住居費': '#85C1E9',
  '保険': '#F8B500',
  '税金': '#E74C3C',
  'その他': '#95A5A6',
};

// デフォルトの色パレット（未定義カテゴリ用）
const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#E74C3C', '#95A5A6', '#58D68D', '#AF7AC5',
];

// 日付文字列をDateオブジェクトに変換
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // 複数のフォーマットを試す
  const formats = ['yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy/M/d'];
  
  for (const fmt of formats) {
    try {
      const date = parse(dateStr, fmt, new Date());
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch {
      continue;
    }
  }
  
  // 最後の手段としてDateコンストラクタを使用
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// 支出レコードの日付を取得
function getExpenseDate(record: ExpenseRecord): Date | null {
  return parseDate(record.expenseDate) || parseDate(record.customDate || '') || parseDate(record.timestamp);
}

// 収入レコードの日付を取得
function getIncomeDate(record: IncomeRecord): Date | null {
  return parseDate(record.incomeDate) || parseDate(record.customDate || '') || parseDate(record.timestamp);
}

// 月別データを集計
export function calculateMonthlyData(
  expenses: ExpenseRecord[],
  incomes: IncomeRecord[],
  months: number = 12
): MonthlyData[] {
  const monthlyMap = new Map<string, { income: number; expense: number }>();
  
  // 過去N月分の月をキーとして初期化
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthKey = format(date, 'yyyy/MM');
    monthlyMap.set(monthKey, { income: 0, expense: 0 });
  }
  
  // 支出を集計
  for (const expense of expenses) {
    const date = getExpenseDate(expense);
    if (date) {
      const monthKey = format(date, 'yyyy/MM');
      if (monthlyMap.has(monthKey)) {
        const data = monthlyMap.get(monthKey)!;
        data.expense += expense.amount;
      }
    }
  }
  
  // 収入を集計
  for (const income of incomes) {
    const date = getIncomeDate(income);
    if (date) {
      const monthKey = format(date, 'yyyy/MM');
      if (monthlyMap.has(monthKey)) {
        const data = monthlyMap.get(monthKey)!;
        data.income += income.amount;
      }
    }
  }
  
  // 配列に変換
  return Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month: format(parse(month, 'yyyy/MM', new Date()), 'M月', { locale: ja }),
    income: data.income,
    expense: data.expense,
    balance: data.income - data.expense,
  }));
}

// カテゴリ別支出を集計
export function calculateCategoryData(
  expenses: ExpenseRecord[],
  targetMonth?: Date
): CategoryData[] {
  const categoryMap = new Map<string, number>();
  
  const now = targetMonth || new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  // カテゴリ別に集計
  for (const expense of expenses) {
    const date = getExpenseDate(expense);
    if (date && isWithinInterval(date, { start: monthStart, end: monthEnd })) {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    }
  }
  
  // 合計を計算
  const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
  
  // 配列に変換してソート
  let colorIndex = 0;
  return Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => {
      const color = CATEGORY_COLORS[category] || DEFAULT_COLORS[colorIndex++ % DEFAULT_COLORS.length];
      return {
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color,
      };
    });
}

// 前月比較データを計算
export function calculateMonthComparison(expenses: ExpenseRecord[], targetMonth?: Date): MonthComparisonData[] {
  const now = targetMonth || new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonth = subMonths(now, 1);
  const previousMonthStart = startOfMonth(previousMonth);
  const previousMonthEnd = endOfMonth(previousMonth);
  
  const currentCategories = new Map<string, number>();
  const previousCategories = new Map<string, number>();
  
  for (const expense of expenses) {
    const date = getExpenseDate(expense);
    if (!date) continue;
    
    if (isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd })) {
      const current = currentCategories.get(expense.category) || 0;
      currentCategories.set(expense.category, current + expense.amount);
    } else if (isWithinInterval(date, { start: previousMonthStart, end: previousMonthEnd })) {
      const current = previousCategories.get(expense.category) || 0;
      previousCategories.set(expense.category, current + expense.amount);
    }
  }
  
  // 全カテゴリを収集
  const allCategories = new Set([
    ...currentCategories.keys(),
    ...previousCategories.keys(),
  ]);
  
  return Array.from(allCategories).map(category => {
    const currentMonth = currentCategories.get(category) || 0;
    const previousMonthValue = previousCategories.get(category) || 0;
    const difference = currentMonth - previousMonthValue;
    const percentChange = previousMonthValue > 0
      ? ((currentMonth - previousMonthValue) / previousMonthValue) * 100
      : currentMonth > 0 ? 100 : 0;
    
    return {
      category,
      currentMonth,
      previousMonth: previousMonthValue,
      difference,
      percentChange,
    };
  }).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}

// 支出ランキングを取得
export function getSpendingRanking(
  expenses: ExpenseRecord[],
  targetMonth?: Date,
  limit: number = 5
): CategoryData[] {
  return calculateCategoryData(expenses, targetMonth).slice(0, limit);
}

// 月別トレンドデータを計算
export function calculateMonthlyTrend(
  expenses: ExpenseRecord[],
  months: number = 6
): TrendData[] {
  const now = new Date();
  const categoryMonthlyData = new Map<string, Map<string, number>>();
  
  // 月キーを生成
  const monthKeys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    monthKeys.push(format(date, 'yyyy/MM'));
  }
  
  // カテゴリ別・月別に集計
  for (const expense of expenses) {
    const date = getExpenseDate(expense);
    if (!date) continue;
    
    const monthKey = format(date, 'yyyy/MM');
    if (!monthKeys.includes(monthKey)) continue;
    
    if (!categoryMonthlyData.has(expense.category)) {
      categoryMonthlyData.set(expense.category, new Map());
    }
    
    const categoryData = categoryMonthlyData.get(expense.category)!;
    const current = categoryData.get(monthKey) || 0;
    categoryData.set(monthKey, current + expense.amount);
  }
  
  // トレンドデータを構築
  return monthKeys.map(monthKey => {
    const trendItem: TrendData = {
      month: format(parse(monthKey, 'yyyy/MM', new Date()), 'M月', { locale: ja }),
    };
    
    for (const [category, monthlyData] of categoryMonthlyData) {
      trendItem[category] = monthlyData.get(monthKey) || 0;
    }
    
    return trendItem;
  });
}

// 直近の取引を取得
export function getRecentTransactions(
  expenses: ExpenseRecord[],
  incomes: IncomeRecord[],
  limit: number = 10
): Array<{
  date: string;
  item: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}> {
  const transactions: Array<{
    date: Date;
    dateStr: string;
    item: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
  }> = [];
  
  for (const expense of expenses) {
    const date = getExpenseDate(expense);
    if (date) {
      transactions.push({
        date,
        dateStr: format(date, 'MM/dd'),
        item: expense.item,
        category: expense.category,
        amount: expense.amount,
        type: 'expense',
      });
    }
  }
  
  for (const income of incomes) {
    const date = getIncomeDate(income);
    if (date) {
      transactions.push({
        date,
        dateStr: format(date, 'MM/dd'),
        item: income.item,
        category: income.category,
        amount: income.amount,
        type: 'income',
      });
    }
  }
  
  // 日付でソートして最新のものを返す
  return transactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)
    .map(({ dateStr, item, category, amount, type }) => ({
      date: dateStr,
      item,
      category,
      amount,
      type,
    }));
}

// 年間サマリーを計算
export function calculateYearlySummary(
  expenses: ExpenseRecord[],
  incomes: IncomeRecord[],
  year?: number
): {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  averageMonthlyIncome: number;
  averageMonthlyExpense: number;
  monthsWithData: number;
} {
  const targetYear = year || new Date().getFullYear();
  
  let totalIncome = 0;
  let totalExpense = 0;
  const monthsWithIncome = new Set<string>();
  const monthsWithExpense = new Set<string>();
  
  for (const expense of expenses) {
    const date = getExpenseDate(expense);
    if (date && date.getFullYear() === targetYear) {
      totalExpense += expense.amount;
      monthsWithExpense.add(format(date, 'yyyy/MM'));
    }
  }
  
  for (const income of incomes) {
    const date = getIncomeDate(income);
    if (date && date.getFullYear() === targetYear) {
      totalIncome += income.amount;
      monthsWithIncome.add(format(date, 'yyyy/MM'));
    }
  }
  
  const monthsWithData = Math.max(monthsWithIncome.size, monthsWithExpense.size, 1);
  
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    averageMonthlyIncome: totalIncome / monthsWithData,
    averageMonthlyExpense: totalExpense / monthsWithData,
    monthsWithData,
  };
}

// 金額をフォーマット
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount);
}

// パーセンテージをフォーマット
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

