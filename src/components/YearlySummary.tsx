import { Calendar, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/dataProcessor';

interface YearlySummaryProps {
  data: {
    totalExpense: number;
    averageMonthlyExpense: number;
    monthsWithData: number;
  };
  year?: number;
  onYearChange?: (year: number) => void;
}

export function YearlySummary({ data, year, onYearChange }: YearlySummaryProps) {
  const currentYear = year || new Date().getFullYear();
  const canNavigate = onYearChange !== undefined;
  
  const handlePrevYear = () => {
    if (onYearChange) onYearChange(currentYear - 1);
  };

  const handleNextYear = () => {
    if (onYearChange && currentYear < new Date().getFullYear()) {
      onYearChange(currentYear + 1);
    }
  };

  const canGoNext = currentYear < new Date().getFullYear();

  return (
    <div className="card yearly-summary">
      <div className="yearly-header">
        <h3 className="card-title">
          <Calendar size={20} />
          年間支出サマリー
        </h3>
        
        {canNavigate && (
          <div className="year-selector">
            <button className="year-nav-btn" onClick={handlePrevYear} title="前年">
              <ChevronLeft size={18} />
            </button>
            <span className="year-display">{currentYear}年</span>
            <button className="year-nav-btn" onClick={handleNextYear} disabled={!canGoNext} title="次年">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="summary-grid">
        <div className="summary-item expense-large">
          <div className="summary-icon">
            <TrendingDown size={32} />
          </div>
          <div className="summary-content">
            <span className="summary-label">{currentYear}年 年間総支出</span>
            <span className="summary-value amount-expense-large">
              {formatCurrency(data.totalExpense)}
            </span>
          </div>
        </div>

        <div className="summary-item expense-sub">
          <div className="summary-content">
            <span className="summary-label">月平均支出</span>
            <span className="summary-value amount-expense">
              {formatCurrency(data.averageMonthlyExpense)}
            </span>
            <span className="summary-sub">
              {data.monthsWithData}ヶ月分のデータに基づく
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .yearly-summary { grid-column: span 2; }
        .yearly-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .yearly-header .card-title { margin-bottom: 0; }
        .year-selector { display: flex; align-items: center; gap: 8px; padding: 4px; background: var(--color-bg-primary); border-radius: var(--radius-md); border: 1px solid var(--color-border); }
        .year-nav-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: transparent; border: none; border-radius: var(--radius-sm); color: var(--color-text-secondary); cursor: pointer; transition: all var(--transition-fast); }
        .year-nav-btn:hover:not(:disabled) { background: var(--color-bg-hover); color: var(--color-accent-primary); }
        .year-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .year-display { font-size: 0.95rem; font-weight: 600; color: var(--color-text-primary); min-width: 60px; text-align: center; }
        
        .summary-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
        .summary-item { display: flex; align-items: center; gap: 20px; padding: 24px; background: var(--color-bg-primary); border-radius: var(--radius-md); border: 1px solid var(--color-border); }
        .summary-item.expense-large { border-left: 4px solid var(--color-expense); }
        .summary-icon { display: flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: var(--radius-md); background: rgba(244, 63, 94, 0.1); color: var(--color-expense); flex-shrink: 0; }
        .summary-content { display: flex; flex-direction: column; gap: 6px; }
        .summary-label { font-size: 0.9rem; color: var(--color-text-secondary); font-weight: 500; }
        .summary-value { font-family: 'Outfit', monospace; font-weight: 700; letter-spacing: -0.02em; }
        .amount-expense-large { font-size: 2.5rem; color: var(--color-text-primary); }
        .amount-expense { font-size: 1.5rem; color: var(--color-expense); }
        .summary-sub { font-size: 0.8rem; color: var(--color-text-muted); }

        @media (max-width: 768px) {
          .yearly-summary { grid-column: span 1; }
          .summary-grid { grid-template-columns: 1fr; }
          .yearly-header { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>
    </div>
  );
}
