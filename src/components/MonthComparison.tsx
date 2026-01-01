import { GitCompare } from 'lucide-react';
import type { MonthComparisonData } from '../types';
import { formatCurrency } from '../utils/dataProcessor';

interface MonthComparisonProps {
  data: MonthComparisonData[];
  currentMonthLabel: string;
  previousMonthLabel: string;
}

export function MonthComparison({ data, currentMonthLabel, previousMonthLabel }: MonthComparisonProps) {
  return (
    <div className="card month-comparison">
      <h3 className="card-title">
        <GitCompare size={20} strokeWidth={1.5} />
        {currentMonthLabel} vs {previousMonthLabel}
      </h3>

      <div className="comparison-list">
        {data.length === 0 ? (
          <div className="no-data">データがありません</div>
        ) : (
          data.map((item, index) => (
            <div key={index} className="comparison-item">
              <div className="comparison-header">
                <span className="comparison-category">{item.category}</span>
                <div className="comparison-badges">
                  <span className={`diff-badge ${item.difference <= 0 ? 'good' : 'bad'}`}>
                    {item.difference > 0 ? '+' : ''}{formatCurrency(item.difference)}
                  </span>
                </div>
              </div>
              
              <div className="comparison-bar-chart">
                <div className="bar-group">
                  <div className="bar-label">{previousMonthLabel}</div>
                  <div className="bar-container">
                    <div 
                      className="bar previous" 
                      style={{ width: `${Math.max((item.previousMonth / Math.max(item.currentMonth, item.previousMonth)) * 100, 2)}%` }}
                    />
                  </div>
                  <div className="bar-value">{formatCurrency(item.previousMonth)}</div>
                </div>
                <div className="bar-group">
                  <div className="bar-label">{currentMonthLabel}</div>
                  <div className="bar-container">
                    <div 
                      className="bar current" 
                      style={{ width: `${Math.max((item.currentMonth / Math.max(item.currentMonth, item.previousMonth)) * 100, 2)}%` }}
                    />
                  </div>
                  <div className="bar-value">{formatCurrency(item.currentMonth)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .month-comparison { min-height: 400px; }
        .comparison-list { display: flex; flex-direction: column; gap: 32px; }
        .comparison-item { display: flex; flex-direction: column; gap: 16px; }
        
        .comparison-header { display: flex; justify-content: space-between; align-items: center; }
        .comparison-category { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
        
        .diff-badge { font-family: 'Outfit'; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
        .diff-badge.good { background: #f0fdf4; color: #16a34a; }
        .diff-badge.bad { background: #fef2f2; color: #dc2626; }

        .comparison-bar-chart { display: flex; flex-direction: column; gap: 8px; }
        .bar-group { display: grid; grid-template-columns: 45px 1fr 80px; align-items: center; gap: 12px; }
        .bar-label { font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500; }
        .bar-container { height: 6px; background: var(--color-bg-primary); border-radius: 3px; overflow: hidden; }
        .bar { height: 100%; border-radius: 3px; }
        .bar.previous { background: var(--color-text-muted); opacity: 0.2; }
        .bar.current { background: var(--color-accent); }
        .bar-value { font-family: 'Outfit'; font-size: 0.8rem; font-weight: 600; text-align: right; color: var(--color-text-primary); }

        .no-data { text-align: center; padding: 40px 20px; color: var(--color-text-muted); font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
