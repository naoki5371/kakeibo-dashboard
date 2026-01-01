import { format, parse, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import type {
  ExpenseRecord,
  MonthlyData,
  CategoryData,
  MonthComparisonData,
  TrendData,
} from '../types';

// カテゴリごとの色を定義（ユーザー定義の14カテゴリ）
const CATEGORY_COLORS: Record<string, string> = {
  '01 食費': '#FF6B6B',
  '02 生活品': '#4ECDC4',
  '03 光熱費': '#45B7D1',
  '04 通信費': '#96CEB4',
  '05 被服費': '#FFEAA7',
  '06 美容費': '#DDA0DD',
  '07 交通費・車両費': '#98D8C8',
  '08 住宅ローン・家賃': '#F7DC6F',
  '09 教育費': '#BB8FCE',
  '10 習いごと': '#85C1E9',
  '11 医療費': '#F8B500',
  '12 娯楽・交際費': '#E74C3C',
  '13 保険料': '#95A5A6',
  '14 臨時出費': '#58D68D',
};

// カテゴリのマスターリスト（表示順を固定するため）
const CATEGORY_MASTER = [
  '01 食費',
  '02 生活品',
  '03 光熱費',
  '04 通信費',
  '05 被服費',
  '06 美容費',
  '07 交通費・車両費',
  '08 住宅ローン・家賃',
  '09 教育費',
  '10 習いごと',
  '11 医療費',
  '12 娯楽・交際費',
  '13 保険料',
  '14 臨時出費',
];

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#E74C3C', '#95A5A6', '#58D68D', '#AF7AC5',
];

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const formats = ['yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy/M/d'];
  for (const fmt of formats) {
    try {
      const date = parse(dateStr, fmt, new Date());
      if (!isNaN(date.getTime())) return date;
    } catch { continue; }
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

function getExpenseDate(record: ExpenseRecord): Date | null {
  return parseDate(record.expenseDate) || parseDate(record.customDate || '') || parseDate(record.timestamp);
}

// 月別支出を集計
export function calculateMonthlyData(
  expenses: ExpenseRecord[],
  months: number = 12
): MonthlyData[] {
  const monthlyMap = new Map<string, number>();
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthKey = format(date, 'yyyy/MM');
    monthlyMap.set(monthKey, 0);
  }
  
  for (const expense of expenses) {
    const date = getExpenseDate(expense);
    if (date) {
      const monthKey = format(date, 'yyyy/MM');
      if (monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + expense.amount);
      }
    }
  }
  
  return Array.from(monthlyMap.entries()).map(([month, expense]) => ({
    month: format(parse(month, 'yyyy/MM', new Date()), 'M月', { locale: ja }),
    expense,
  }));
}

// カテゴリ別支出を集計
export function calculateCategoryData(
  expenses: ExpenseRecord[],
  targetMonth?: Date
): CategoryData[] {
  const categoryMap = new Map<string, number>();
  
  // マスターリストのすべてのカテゴリを0円で初期化
  CATEGORY_MASTER.forEach(cat => {
    categoryMap.set(cat, 0);
  });
  
  const now = targetMonth || new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  // 選択月のカテゴリ別に集計
  for (const expense of expenses) {
    const date = getExpenseDate(expense);
    if (date && isWithinInterval(date, { start: monthStart, end: monthEnd })) {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    }
  }
  
  const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
  
  // マスターリストの順番（01〜14）を維持して配列に変換
  return CATEGORY_MASTER.map((category) => {
    const amount = categoryMap.get(category) || 0;
    const color = CATEGORY_COLORS[category] || '#95A5A6';
    
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

export function getSpendingRanking(
  expenses: ExpenseRecord[],
  targetMonth?: Date,
  limit: number = 5
): CategoryData[] {
  return calculateCategoryData(expenses, targetMonth).slice(0, limit);
}

export function calculateMonthlyTrend(
  expenses: ExpenseRecord[],
  months: number = 6
): TrendData[] {
  const now = new Date();
  const categoryMonthlyData = new Map<string, Map<string, number>>();
  const monthKeys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    monthKeys.push(format(date, 'yyyy/MM'));
  }
  
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

export function getRecentTransactions(
  expenses: ExpenseRecord[],
  limit: number = 10
): Array<{
  date: string;
  item: string;
  category: string;
  amount: number;
  type: 'expense';
}> {
  return expenses
    .map(expense => {
      const date = getExpenseDate(expense);
      return {
        date: date || new Date(0),
        dateStr: date ? format(date, 'MM/dd') : '',
        item: expense.item,
        category: expense.category,
        amount: expense.amount,
        type: 'expense' as const,
      };
    })
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

export function calculateYearlySummary(
  expenses: ExpenseRecord[],
  year?: number
): {
  totalExpense: number;
  averageMonthlyExpense: number;
  monthsWithData: number;
} {
  const targetYear = year || new Date().getFullYear();
  let totalExpense = 0;
  const monthsWithExpense = new Set<string>();
  
  for (const expense of expenses) {
    const date = getExpenseDate(expense);
    if (date && date.getFullYear() === targetYear) {
      totalExpense += expense.amount;
      monthsWithExpense.add(format(date, 'yyyy/MM'));
    }
  }
  
  const monthsWithData = Math.max(monthsWithExpense.size, 1);
  return {
    totalExpense,
    averageMonthlyExpense: totalExpense / monthsWithData,
    monthsWithData,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
