import { useMemo, useState, useRef } from 'react';
import { RefreshCw, AlertCircle, TrendingDown, CreditCard, Download } from 'lucide-react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import type { ExpenseRecord } from '../types';
import {
  calculateMonthlyData,
  calculateCategoryData,
  calculateMonthComparison,
  getSpendingRanking,
  calculateMonthlyTrend,
  getRecentTransactions,
  calculateYearlySummary,
  calculateYearlyCategoryData,
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
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export function Dashboard({
  expenses,
  loading,
  error,
  lastUpdated,
  onRefresh,
}: DashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);

  // PDF出力処理
  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    
    setIsExporting(true);
    
    // レイアウト変更がブラウザに反映されるのを待つ
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const element = dashboardRef.current;
    
    // 表示中の月からファイル名を生成 (例: 2026.01 家計簿ダッシュボード)
    const fileName = `${format(selectedMonth, 'yyyy.MM')} 家計簿ダッシュボード.pdf`;
    
    // 1枚の長いページとして出力するためのサイズ計算
    const width = 1100; // 固定幅
    const height = element.scrollHeight + 100; // コンテンツの高さ + 余白
    
    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#f8fafc',
        windowWidth: 1200,
        scrollY: 0
      },
      jsPDF: { 
        unit: 'px' as const, 
        format: [width, height] as [number, number],
        hotfixes: ['px_scaling'] as any
      }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDFの出力に失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  const monthlyData = useMemo(
    () => calculateMonthlyData(expenses, 12),
    [expenses]
  );

  const categoryData = useMemo(
    () => calculateCategoryData(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  const monthComparisonData = useMemo(
    () => calculateMonthComparison(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  const spendingRanking = useMemo(
    () => getSpendingRanking(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  const trendData = useMemo(
    () => calculateMonthlyTrend(expenses, 6),
    [expenses]
  );

  const recentTransactions = useMemo(
    () => getRecentTransactions(expenses, 10),
    [expenses]
  );

  const yearlySummary = useMemo(
    () => calculateYearlySummary(expenses, selectedYear),
    [expenses, selectedYear]
  );

  const yearlyCategoryData = useMemo(
    () => calculateYearlyCategoryData(expenses, selectedYear),
    [expenses, selectedYear]
  );

  const selectedMonthSummary = useMemo(() => {
    const monthKey = format(selectedMonth, 'M月', { locale: ja });
    const found = monthlyData.find(d => d.month === monthKey);
    return found || { expense: 0 };
  }, [monthlyData, selectedMonth]);

  const monthLabel = format(selectedMonth, 'M月', { locale: ja });
  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} />
        <h2>データの取得に失敗しました</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={onRefresh}>
          <RefreshCw size={18} /> 再試行
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">支出分析ダッシュボード</h1>
          {lastUpdated && (
            <span className="last-updated">最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}</span>
          )}
        </div>
        <div className="dashboard-actions">
          <button 
            className="btn btn-secondary pdf-btn" 
            onClick={handleExportPDF} 
            disabled={loading || isExporting}
          >
            <Download size={18} className={isExporting ? 'animate-pulse' : ''} />
            {isExporting ? '出力中...' : 'PDFを出力'}
          </button>
          <button className="btn btn-secondary refresh-btn" onClick={onRefresh} disabled={loading || isExporting}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            {loading ? '更新中...' : 'データを更新'}
          </button>
        </div>
      </div>

      <div ref={dashboardRef} className={`dashboard-content-to-export ${isExporting ? 'pdf-export-mode' : ''}`}>
        <div className="month-selector-container hide-on-pdf">
          <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        </div>

        <div className="summary-cards single-card">
          <div className="summary-card expense-primary animate-fade-in">
            <div className="summary-card-icon">
              <TrendingDown size={32} />
            </div>
            <div className="summary-card-content">
              <span className="summary-card-label">{isCurrentMonth ? '今月' : monthLabel}の総支出</span>
              <span className="summary-card-value amount-expense-large">
                {formatCurrency(selectedMonthSummary.expense)}
              </span>
            </div>
            <div className="summary-card-stats hide-on-pdf">
              <div className="stat-item">
                <CreditCard size={16} />
                <span>{expenses.filter(e => format(new Date(e.expenseDate), 'yyyy-MM') === format(selectedMonth, 'yyyy-MM')).length} 件の取引</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <YearlySummary data={yearlySummary} year={selectedYear} onYearChange={setSelectedYear} />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <CategoryPieChart 
              data={yearlyCategoryData} 
              title={`${selectedYear}年の年間カテゴリ別支出`}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <MonthlyChart data={monthlyData} />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CategoryPieChart data={categoryData} title={`${isCurrentMonth ? '今月' : monthLabel}のカテゴリ別支出`} />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <SpendingRanking data={spendingRanking} title={`${isCurrentMonth ? '今月' : monthLabel}の支出TOP5`} />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
            <MonthComparison data={monthComparisonData} currentMonthLabel={monthLabel} previousMonthLabel={format(subMonths(selectedMonth, 1), 'M月', { locale: ja })} />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
            <RecentTransactions data={recentTransactions} />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '700ms' }}>
            <MonthlyTrend data={trendData} />
          </div>
        </div>
      </div>

      <style>{`
        .dashboard { max-width: 1400px; margin: 0 auto; padding: 32px 24px; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .dashboard-title { font-size: 1.75rem; font-weight: 700; color: var(--color-text-primary); }
        .last-updated { font-size: 0.8rem; color: var(--color-text-muted); }
        .dashboard-actions { display: flex; gap: 12px; align-items: center; }
        .pdf-btn:hover { border-color: var(--color-accent-secondary); color: var(--color-accent-secondary); }
        
        .month-selector-container { margin-bottom: 32px; }
        
        /* PDF出力時のスタイル調整 */
        @media print {
          .hide-on-pdf { display: none !important; }
        }
        
        .dashboard-content-to-export { background: transparent; padding: 4px; border-radius: var(--radius-xl); transition: all 0.3s ease; }
        
        .pdf-export-mode { background: #f8fafc !important; width: 1100px !important; padding: 60px !important; margin: 0 !important; border-radius: 0 !important; overflow: visible !important; }
        .pdf-export-mode .dashboard-grid { display: flex !important; flex-direction: column !important; gap: 40px !important; width: 100% !important; }
        .pdf-export-mode .card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; break-inside: avoid !important; width: 100% !important; margin-bottom: 0 !important; }
        .pdf-export-mode .animate-fade-in { opacity: 1 !important; transform: none !important; animation: none !important; visibility: visible !important; }
        .pdf-export-mode .summary-card-content { white-space: nowrap !important; }
        .pdf-export-mode .pie-chart-container { width: 100% !important; height: 350px !important; }
        
        .summary-cards.single-card { margin-bottom: 32px; }
        .summary-card.expense-primary { display: flex; align-items: center; justify-content: space-between; padding: 40px; background: white; border: 1px solid var(--color-border); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); border-left: 6px solid var(--color-expense); }
        .summary-card-icon { width: 80px; height: 80px; background: rgba(244, 63, 94, 0.1); color: var(--color-expense); border-radius: 20px; display: flex; align-items: center; justify-content: center; }
        .summary-card-content { flex: 1; margin-left: 32px; }
        .summary-card-label { font-size: 1.1rem; color: var(--color-text-secondary); margin-bottom: 8px; display: block; }
        .amount-expense-large { font-size: 3.5rem; font-weight: 800; color: var(--color-text-primary); font-family: 'Outfit', sans-serif; }
        .summary-card-stats { display: flex; flex-direction: column; gap: 12px; border-left: 1px solid var(--color-border); padding-left: 32px; }
        .stat-item { display: flex; align-items: center; gap: 8px; color: var(--color-text-secondary); font-size: 0.95rem; }

        .dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }

        @media (max-width: 900px) {
          .summary-card.expense-primary { flex-direction: column; text-align: center; gap: 24px; padding: 32px; }
          .summary-card-content { margin-left: 0; }
          .summary-card-stats { border-left: none; padding-left: 0; border-top: 1px solid var(--color-border); padding-top: 24px; width: 100%; justify-content: center; }
          .dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
