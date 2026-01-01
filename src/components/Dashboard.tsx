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
  getRecentTransactions,
  calculateYearlySummary,
  calculateYearlyCategoryData,
  calculateCategoryMonthlyTable,
} from '../utils/dataProcessor';
import { MonthlyChart } from './MonthlyChart';
import { CategoryPieChart } from './CategoryPieChart';
import { YearlySummary } from './YearlySummary';
import { MonthComparison } from './MonthComparison';
import { SpendingRanking } from './SpendingRanking';
import { RecentTransactions } from './RecentTransactions';
import { MonthSelector } from './MonthSelector';
import { CategoryMonthlyTable } from './CategoryMonthlyTable';

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
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const element = dashboardRef.current;
    const fileName = `${format(selectedMonth, 'yyyy.MM')} 家計簿ダッシュボード.pdf`;
    const width = 1800; // PDFの幅を特大に拡大
    const height = element.scrollHeight + 100;
    
    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#fafafa',
        windowWidth: 1800, // ウィンドウ幅も特大に
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

  // データ集計
  const monthlyData = useMemo(() => calculateMonthlyData(expenses, 12), [expenses]);
  const categoryData = useMemo(() => calculateCategoryData(expenses, selectedMonth), [expenses, selectedMonth]);
  const monthComparisonData = useMemo(() => calculateMonthComparison(expenses, selectedMonth), [expenses, selectedMonth]);
  const spendingRanking = useMemo(() => getSpendingRanking(expenses, selectedMonth), [expenses, selectedMonth]);
  const recentTransactions = useMemo(() => getRecentTransactions(expenses, 50), [expenses]);
  const yearlySummary = useMemo(() => calculateYearlySummary(expenses, selectedYear), [expenses, selectedYear]);
  const yearlyCategoryData = useMemo(() => calculateYearlyCategoryData(expenses, selectedYear), [expenses, selectedYear]);
  const categoryMonthlyTableData = useMemo(() => calculateCategoryMonthlyTable(expenses, selectedYear), [expenses, selectedYear]);

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
        <button className="btn btn-primary" onClick={onRefresh}><RefreshCw size={18} /> 再試行</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">支出分析ダッシュボード</h1>
          {lastUpdated && <span className="last-updated">最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}</span>}
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary pdf-btn" onClick={handleExportPDF} disabled={loading || isExporting}>
            <Download size={18} strokeWidth={1.5} className={isExporting ? 'animate-pulse' : ''} />
            {isExporting ? '出力中...' : 'PDFを出力'}
          </button>
          <button className="btn btn-secondary refresh-btn" onClick={onRefresh} disabled={loading || isExporting}>
            <RefreshCw size={18} strokeWidth={1.5} className={loading ? 'spinning' : ''} />
            {loading ? '更新中...' : 'データを更新'}
          </button>
        </div>
      </div>

      <div ref={dashboardRef} className={`dashboard-content-to-export ${isExporting ? 'pdf-export-mode' : ''}`}>
        <div className="month-selector-container hide-on-pdf">
          <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        </div>

        {/* 1. 今月の総支出 - ミニマルで洗練されたデザイン */}
        <div className="summary-cards single-card section-margin">
          <div className="main-summary-card animate-fade-in">
            <div className="main-summary-content">
              <div className="main-summary-info">
                <span className="main-summary-label">{isCurrentMonth ? '今月' : monthLabel}の支出合計</span>
                <h2 className="main-summary-value">
                  <span className="currency-symbol">¥</span>
                  {selectedMonthSummary.expense.toLocaleString()}
                </h2>
              </div>
              <div className="main-summary-stats hide-on-pdf">
                <div className="stat-badge">
                  <CreditCard size={14} strokeWidth={2} />
                  <span>{expenses.filter(e => format(new Date(e.expenseDate), 'yyyy-MM') === format(selectedMonth, 'yyyy-MM')).length} Transactions</span>
                </div>
              </div>
            </div>
            <div className="main-summary-decoration">
              <TrendingDown size={120} strokeWidth={0.5} />
            </div>
          </div>
        </div>

        <div className="dashboard-grid section-margin-large">
          {/* 2. 月間詳細 2カラム */}
          <div className="animate-fade-in"><CategoryPieChart data={categoryData} title={`${monthLabel}のカテゴリ別支出`} /></div>
          <div className="animate-fade-in"><SpendingRanking data={spendingRanking} title={`${monthLabel}の支出TOP10`} /></div>

          {/* 3. 比較・履歴 2カラム */}
          <div className="animate-fade-in section-margin-top">
            <MonthComparison 
              data={monthComparisonData} 
              currentMonthLabel={monthLabel} 
              previousMonthLabel={format(subMonths(selectedMonth, 1), 'M月', { locale: ja })} 
            />
          </div>
          <div className="animate-fade-in section-margin-top"><RecentTransactions data={recentTransactions} /></div>

          {/* 4. 年間集計 2カラム */}
          <div className="animate-fade-in section-margin-top"><YearlySummary data={yearlySummary} year={selectedYear} onYearChange={setSelectedYear} /></div>
          <div className="animate-fade-in section-margin-top"><CategoryPieChart data={yearlyCategoryData} title={`${selectedYear}年の年間カテゴリ別支出`} /></div>
        </div>

        {/* 5. 推移 1カラム */}
        <div className="animate-fade-in section-margin-large"><MonthlyChart data={monthlyData} /></div>

        {/* 6. 一覧表 1カラム */}
        <div className="section-margin-large"><CategoryMonthlyTable data={categoryMonthlyTableData} year={selectedYear} /></div>
      </div>

      <style>{`
        .dashboard { max-width: 1400px; margin: 0 auto; padding: 48px 32px; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; flex-wrap: wrap; gap: 24px; }
        .dashboard-title { font-size: 2.25rem; font-weight: 800; color: var(--color-text-primary); letter-spacing: -0.03em; }
        .last-updated { font-size: 0.75rem; color: var(--color-text-muted); font-family: 'Outfit'; margin-top: 4px; display: block; }
        .dashboard-actions { display: flex; gap: 16px; align-items: center; }
        
        .month-selector-container { margin-bottom: 40px; }
        
        .pdf-export-mode .transaction-date, .pdf-export-mode .transaction-category, .pdf-export-mode .rank-num, .pdf-export-mode .ranking-percent-text, .pdf-export-mode .pie-chart-total-label, .pdf-export-mode .category-percent { color: #000000 !important; opacity: 1 !important; }
        .pdf-export-mode .category-list-item.zero-amount { opacity: 1 !important; }
        .pdf-export-mode .transaction-category { background: transparent !important; border: 1px solid #000000 !important; }
        .pdf-export-mode .recharts-rectangle { fill-opacity: 1 !important; stroke-opacity: 1 !important; }
        .pdf-export-mode .recharts-bar-rectangle path { fill-opacity: 1 !important; }
        .pdf-export-mode .recharts-cartesian-grid-horizontal line, .pdf-export-mode .recharts-cartesian-grid-vertical line { stroke: #000000 !important; stroke-opacity: 0.3 !important; }
        .pdf-export-mode svg text { fill: #000000 !important; }
        
        @media print { .hide-on-pdf { display: none !important; } }
        
        .dashboard-content-to-export { background: transparent; padding: 4px; transition: all 0.3s ease; }
        .section-margin { margin-top: 40px; }
        .section-margin-top { margin-top: 32px; }
        .section-margin-large { margin-top: 64px; }
        
        /* メインサマリーカードの刷新 */
        .main-summary-card {
          position: relative;
          background: var(--color-accent);
          color: white;
          padding: 56px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: 0 30px 60px -12px rgba(15, 23, 42, 0.12);
        }
        
        .main-summary-content { position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: center; }
        .main-summary-label { font-size: 1rem; font-weight: 500; opacity: 0.8; margin-bottom: 12px; display: block; }
        .main-summary-value { font-family: 'Outfit'; font-size: 4.5rem; font-weight: 800; line-height: 1; display: flex; align-items: baseline; gap: 8px; }
        .currency-symbol { font-size: 2.5rem; font-weight: 400; opacity: 0.6; }
        
        .main-summary-stats { display: flex; gap: 16px; margin-top: 24px; }
        .stat-badge { background: rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255, 255, 255, 0.1); }
        
        .main-summary-decoration { position: absolute; right: -20px; top: 50%; transform: translateY(-50%); opacity: 0.1; pointer-events: none; }
        
        .dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; }

        .pdf-export-mode { background: #fafafa !important; width: 1500px !important; padding: 80px !important; margin: 0 !important; }
        .pdf-export-mode .dashboard-grid { display: flex !important; flex-direction: column !important; gap: 56px !important; }
        .pdf-export-mode .card { box-shadow: none !important; border: 1px solid #cbd5e1 !important; margin-bottom: 0 !important; }
        .pdf-export-mode .main-summary-card { box-shadow: none !important; margin-bottom: 56px !important; background: #334155 !important; }
        .pdf-export-mode .section-margin-large { margin-top: 80px !important; }
        
        /* PDF出力時のバランス調整（読みやすさ重視） */
        .pdf-export-mode * { color: #000000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; opacity: 1 !important; }
        .pdf-export-mode .main-summary-card * { color: #ffffff !important; }
        .pdf-export-mode h1 { font-weight: 800 !important; font-size: 2.5rem !important; }
        .pdf-export-mode h2, .pdf-export-mode h3 { font-weight: 700 !important; }
        .pdf-export-mode span, .pdf-export-mode p, .pdf-export-mode div, .pdf-export-mode td, .pdf-export-mode th { font-weight: 400 !important; }
        .pdf-export-mode .main-summary-value, .pdf-export-mode .pie-chart-total-amount, .pdf-export-mode .ranking-amount, .pdf-export-mode .amount-cell { font-weight: 700 !important; }
        
        .pdf-export-mode .recharts-text { fill: #000000 !important; font-weight: 500 !important; }
        .pdf-export-mode .recharts-legend-item-text { color: #000000 !important; font-weight: 500 !important; }
        
        /* 表の見切れ対策 - 徹底強化 */
        .pdf-export-mode .table-wrapper { border: none !important; width: 1700px !important; }
        .pdf-export-mode .table-container { overflow: visible !important; width: 1700px !important; }
        .pdf-export-mode .analysis-table { table-layout: fixed !important; width: 1700px !important; border: 1px solid #000000 !important; }
        .pdf-export-mode .analysis-table th, .pdf-export-mode .analysis-table td { 
          border: 1px solid #000000 !important; 
          padding: 6px 2px !important; 
          font-size: 8.5px !important; 
        }
        .pdf-export-mode .sticky-col { position: static !important; width: 90px !important; min-width: 90px !important; border-right: 1px solid #000000 !important; }
        .pdf-export-mode .month-col { width: 95px !important; min-width: 95px !important; }
        .pdf-export-mode .total-col, .pdf-export-mode .total-cell { width: 110px !important; min-width: 110px !important; background: #f1f5f9 !important; }
        .pdf-export-mode .grand-total-row td { border-top: 1.5px solid #000000 !important; }
        
        /* カテゴリリストの見切れ対策 */
        .pdf-export-mode .category-full-list { max-height: none !important; overflow: visible !important; }
        .pdf-export-mode .category-list-item { page-break-inside: avoid; }
        
        .pdf-export-mode .recharts-rectangle { fill-opacity: 1 !important; stroke-opacity: 1 !important; }

        @media (max-width: 1100px) {
          .main-summary-card { padding: 40px; }
          .main-summary-value { font-size: 3.5rem; }
          .dashboard-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
    </div>
  );
}
