import { useMemo, useState } from 'react';
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { ExpenseRecord, IncomeRecord } from '../types';
import {
  calculateMonthlyData,
  calculateCategoryData,
  calculateMonthComparison,
  getSpendingRanking,
  calculateMonthlyTrend,
  getRecentTransactions,
  calculateYearlySummary,
  formatCurrency,
} from '../utils/dataProcessor';
import { MonthlyChart } from './MonthlyChart';
import { CategoryPieChart } from './CategoryPieChart';
import { YearlySummary } from './YearlySummary';
import { MonthComparison } from './MonthComparison';
import { SpendingRanking } from './SpendingRanking';
import { MonthlyTrend } from './MonthlyTrend';
import { RecentTransactions } from './RecentTransactions';
import { MonthSelector } from './MonthSelector';

interface DashboardProps {
  expenses: ExpenseRecord[];
  incomes: IncomeRecord[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export function Dashboard({
  expenses,
  incomes,
  loading,
  error,
  lastUpdated,
  onRefresh,
}: DashboardProps) {
  // 選択中の月
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  
  // 選択中の年（年間サマリー用）
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  // データの集計
  const monthlyData = useMemo(
    () => calculateMonthlyData(expenses, incomes, 12),
    [expenses, incomes]
  );

  // 選択された月のカテゴリ別支出
  const categoryData = useMemo(
    () => calculateCategoryData(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  // 選択された月の前月比較
  const monthComparisonData = useMemo(
    () => calculateMonthComparison(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  // 選択された月の支出ランキング
  const spendingRanking = useMemo(
    () => getSpendingRanking(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  const trendData = useMemo(
    () => calculateMonthlyTrend(expenses, 6),
    [expenses]
  );

  const recentTransactions = useMemo(
    () => getRecentTransactions(expenses, incomes, 10),
    [expenses, incomes]
  );

  const yearlySummary = useMemo(
    () => calculateYearlySummary(expenses, incomes, selectedYear),
    [expenses, incomes, selectedYear]
  );

  // 選択された月のサマリー
  const selectedMonthSummary = useMemo(() => {
    const monthKey = format(selectedMonth, 'M月', { locale: ja });
    const found = monthlyData.find(d => d.month === monthKey);
    return found || { income: 0, expense: 0, balance: 0 };
  }, [monthlyData, selectedMonth]);

  // 月のラベル
  const monthLabel = format(selectedMonth, 'M月', { locale: ja });
  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} />
        <h2>データの取得に失敗しました</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={onRefresh}>
          <RefreshCw size={18} />
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* ヘッダー */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">家計簿ダッシュボード</h1>
          {lastUpdated && (
            <span className="last-updated">
              最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
            </span>
          )}
        </div>
        <button
          className="btn btn-secondary refresh-btn"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          {loading ? '更新中...' : 'データを更新'}
        </button>
      </div>

      {/* 月選択 */}
      <div className="month-selector-container">
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>

      {/* 選択月のサマリーカード */}
      <div className="summary-cards">
        <div className="summary-card income animate-fade-in" style={{ animationDelay: '0ms' }}>
          <div className="summary-card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="summary-card-content">
            <span className="summary-card-label">
              {isCurrentMonth ? '今月' : monthLabel}の収入
            </span>
            <span className="summary-card-value amount-income">
              {formatCurrency(selectedMonthSummary.income)}
            </span>
          </div>
        </div>

        <div className="summary-card expense animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="summary-card-icon">
            <TrendingDown size={24} />
          </div>
          <div className="summary-card-content">
            <span className="summary-card-label">
              {isCurrentMonth ? '今月' : monthLabel}の支出
            </span>
            <span className="summary-card-value amount-expense">
              {formatCurrency(selectedMonthSummary.expense)}
            </span>
          </div>
        </div>

        <div
          className={`summary-card balance animate-fade-in ${selectedMonthSummary.balance >= 0 ? 'positive' : 'negative'}`}
          style={{ animationDelay: '200ms' }}
        >
          <div className="summary-card-icon">
            <Wallet size={24} />
          </div>
          <div className="summary-card-content">
            <span className="summary-card-label">
              {isCurrentMonth ? '今月' : monthLabel}の収支
            </span>
            <span
              className={`summary-card-value ${selectedMonthSummary.balance >= 0 ? 'amount-positive' : 'amount-negative'}`}
            >
              {formatCurrency(selectedMonthSummary.balance)}
            </span>
          </div>
        </div>
      </div>

      {/* グリッドレイアウト */}
      <div className="dashboard-grid">
        {/* 年間サマリー */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <YearlySummary 
            data={yearlySummary} 
            year={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        {/* 月別収支グラフ */}
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <MonthlyChart data={monthlyData} />
        </div>

        {/* カテゴリ別支出 */}
        <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <CategoryPieChart 
            data={categoryData} 
            title={`${isCurrentMonth ? '今月' : monthLabel}のカテゴリ別支出`}
          />
        </div>

        {/* 支出ランキング */}
        <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
          <SpendingRanking 
            data={spendingRanking} 
            title={`${isCurrentMonth ? '今月' : monthLabel}の支出TOP5`}
          />
        </div>

        {/* 前月比較 */}
        <div className="animate-fade-in" style={{ animationDelay: '700ms' }}>
          <MonthComparison 
            data={monthComparisonData}
            currentMonthLabel={monthLabel}
            previousMonthLabel={format(subMonths(selectedMonth, 1), 'M月', { locale: ja })}
          />
        </div>

        {/* 直近取引 */}
        <div className="animate-fade-in" style={{ animationDelay: '800ms' }}>
          <RecentTransactions data={recentTransactions} />
        </div>

        {/* 月別トレンド */}
        <div className="animate-fade-in" style={{ animationDelay: '900ms' }}>
          <MonthlyTrend data={trendData} />
        </div>
      </div>

      <style>{`
        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dashboard-title-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dashboard-title {
          font-size: 1.75rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .last-updated {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .refresh-btn .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .month-selector-container {
          margin-bottom: 24px;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
        }

        .summary-card:hover {
          border-color: var(--color-border-hover);
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .summary-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .summary-card.income .summary-card-icon {
          background: rgba(0, 212, 170, 0.1);
          color: var(--color-income);
        }

        .summary-card.expense .summary-card-icon {
          background: rgba(255, 107, 157, 0.1);
          color: var(--color-expense);
        }

        .summary-card.balance .summary-card-icon {
          background: rgba(124, 92, 255, 0.1);
          color: var(--color-accent-secondary);
        }

        .summary-card.balance.positive .summary-card-icon {
          background: rgba(0, 212, 170, 0.1);
          color: var(--color-income);
        }

        .summary-card.balance.negative .summary-card-icon {
          background: rgba(255, 107, 157, 0.1);
          color: var(--color-expense);
        }

        .summary-card-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-card-label {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .summary-card-value {
          font-family: 'Outfit', monospace;
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          gap: 16px;
          color: var(--color-text-secondary);
        }

        .dashboard-error svg {
          color: var(--color-expense);
        }

        .dashboard-error h2 {
          font-size: 1.25rem;
          color: var(--color-text-primary);
        }

        .dashboard-error p {
          font-size: 0.9rem;
          max-width: 400px;
        }

        @media (max-width: 900px) {
          .summary-cards {
            grid-template-columns: 1fr;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .dashboard {
            padding: 20px 16px;
          }

          .dashboard-title {
            font-size: 1.5rem;
          }

          .summary-card {
            padding: 20px;
          }

          .summary-card-value {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
