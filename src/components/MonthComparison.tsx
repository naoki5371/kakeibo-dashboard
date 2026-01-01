import { ArrowUpRight, ArrowDownRight, Minus, GitCompare } from 'lucide-react';
import type { MonthComparisonData } from '../types';
import { formatCurrency, formatPercentage } from '../utils/dataProcessor';

interface MonthComparisonProps {
  data: MonthComparisonData[];
  currentMonthLabel?: string;
  previousMonthLabel?: string;
}

export function MonthComparison({ data, currentMonthLabel = '今月', previousMonthLabel = '先月' }: MonthComparisonProps) {
  const sortedData = [...data]
    .filter(item => item.currentMonth > 0 || item.previousMonth > 0)
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
    .slice(0, 5);

  return (
    <div className="card month-comparison">
      <h3 className="card-title">
        <GitCompare size={20} />
        {currentMonthLabel} vs {previousMonthLabel}
      </h3>

      <div className="comparison-list">
        {sortedData.length === 0 ? (
          <div className="no-data">比較データがありません</div>
        ) : (
          sortedData.map((item, index) => {
            const isIncrease = item.difference > 0;
            const isDecrease = item.difference < 0;
            const isUnchanged = item.difference === 0;

            return (
              <div key={index} className="comparison-item">
                <div className="comparison-main">
                  <span className="comparison-category">{item.category}</span>
                  <div className="comparison-amounts">
                    <span className="comparison-current">
                      {formatCurrency(item.currentMonth)}
                    </span>
                    <span className="comparison-arrow">←</span>
                    <span className="comparison-previous">
                      {formatCurrency(item.previousMonth)}
                    </span>
                  </div>
                </div>
                
                <div className={`comparison-change ${isIncrease ? 'increase' : isDecrease ? 'decrease' : 'unchanged'}`}>
                  {isIncrease && <ArrowUpRight size={16} />}
                  {isDecrease && <ArrowDownRight size={16} />}
                  {isUnchanged && <Minus size={16} />}
                  <span className="change-amount">
                    {isIncrease ? '+' : ''}{formatCurrency(item.difference)}
                  </span>
                  <span className="change-percent">
                    ({formatPercentage(item.percentChange)})
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .month-comparison {
          min-height: 320px;
        }

        .comparison-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comparison-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 14px 16px;
          background: var(--color-bg-primary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          transition: all var(--transition-fast);
        }

        .comparison-item:hover {
          border-color: var(--color-border-hover);
        }

        .comparison-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .comparison-category {
          font-weight: 500;
          color: var(--color-text-primary);
          font-size: 0.9rem;
        }

        .comparison-amounts {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Outfit', monospace;
          font-size: 0.85rem;
        }

        .comparison-current {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .comparison-arrow {
          color: var(--color-text-muted);
          font-size: 0.75rem;
        }

        .comparison-previous {
          color: var(--color-text-muted);
        }

        .comparison-change {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          width: fit-content;
        }

        .comparison-change.increase {
          background: rgba(255, 107, 157, 0.1);
          color: var(--color-expense);
        }

        .comparison-change.decrease {
          background: rgba(0, 212, 170, 0.1);
          color: var(--color-income);
        }

        .comparison-change.unchanged {
          background: var(--color-bg-hover);
          color: var(--color-text-muted);
        }

        .change-amount {
          font-family: 'Outfit', monospace;
          font-weight: 600;
        }

        .change-percent {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .no-data {
          text-align: center;
          padding: 40px 20px;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

