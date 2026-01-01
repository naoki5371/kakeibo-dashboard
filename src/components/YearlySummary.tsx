import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { YearlySummary as YearlySummaryType } from '../types';
import { formatCurrency } from '../utils/dataProcessor';

interface YearlySummaryProps {
  data: YearlySummaryType;
  year: number;
  onYearChange: (year: number) => void;
}

export function YearlySummary({ data, year, onYearChange }: YearlySummaryProps) {
  return (
    <div className="card yearly-summary">
      <div className="yearly-header">
        <h3 className="card-title">
          <Calendar size={20} strokeWidth={1.5} />
          年間支出サマリー
        </h3>
        
        <div className="year-navigator">
          <button className="nav-btn" onClick={() => onYearChange(year - 1)}>
            <ChevronLeft size={18} />
          </button>
          <span className="current-year">{year}年</span>
          <button className="nav-btn" onClick={() => onYearChange(year + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="yearly-stats-grid">
        <div className="yearly-stat-main">
          <span className="stat-label">{year}年 年間総支出</span>
          <h2 className="stat-value expense">
            {formatCurrency(data.totalExpense)}
          </h2>
        </div>

        <div className="yearly-stat-sub">
          <div className="sub-stat-item">
            <span className="sub-label">月平均支出</span>
            <span className="sub-value">{formatCurrency(data.averageMonthlyExpense)}</span>
          </div>
          <div className="sub-stat-item">
            <span className="sub-label">データ収集</span>
            <span className="sub-value">{data.monthsWithData}ヶ月分</span>
          </div>
        </div>
      </div>

      <style>{`
        .yearly-summary { min-height: 320px; }
        .yearly-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        
        .year-navigator { display: flex; align-items: center; gap: 16px; background: var(--color-bg-primary); padding: 6px 12px; border-radius: 999px; }
        .nav-btn { background: none; border: none; color: var(--color-text-secondary); cursor: pointer; padding: 4px; display: flex; align-items: center; transition: color 0.2s ease; }
        .nav-btn:hover { color: var(--color-accent); }
        .current-year { font-family: 'Outfit'; font-weight: 700; font-size: 1rem; color: var(--color-text-primary); min-width: 60px; text-align: center; }

        .yearly-stats-grid { display: flex; flex-direction: column; gap: 40px; }
        
        .stat-label { font-size: 0.85rem; font-weight: 500; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px; }
        .stat-value { font-family: 'Outfit'; font-size: 2.75rem; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; }
        .stat-value.expense { color: var(--color-text-primary); }

        .yearly-stat-sub { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding-top: 32px; border-top: 1px solid var(--color-border); }
        .sub-label { font-size: 0.75rem; color: var(--color-text-muted); display: block; margin-bottom: 4px; }
        .sub-value { font-family: 'Outfit'; font-size: 1.1rem; font-weight: 700; color: var(--color-text-primary); }
      `}</style>
    </div>
  );
}
