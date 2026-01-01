import { Trophy } from 'lucide-react';
import type { CategoryData } from '../types';
import { formatCurrency } from '../utils/dataProcessor';

interface SpendingRankingProps {
  data: CategoryData[];
  title?: string;
}

export function SpendingRanking({ data, title = '支出TOP10' }: SpendingRankingProps) {
  return (
    <div className="card spending-ranking">
      <h3 className="card-title">
        <Trophy size={20} strokeWidth={1.5} />
        {title}
      </h3>

      <div className="ranking-list">
        {data.length === 0 ? (
          <div className="no-data">データがありません</div>
        ) : (
          data.slice(0, 10).map((item, index) => (
            <div key={index} className="ranking-item">
              <div className="ranking-info">
                <div className="ranking-header">
                  <div className="ranking-main">
                    <span className="rank-num">#{index + 1}</span>
                    <span className="ranking-category">{item.category}</span>
                  </div>
                  <span className="ranking-amount">{formatCurrency(item.amount)}</span>
                </div>
                
                <div className="ranking-bar-container">
                  <div
                    className="ranking-bar"
                    style={{
                      width: `${item.percentage}%`,
                      background: item.color,
                    }}
                  />
                </div>
                <div className="ranking-percent-text">{item.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .spending-ranking { min-height: 320px; }
        .ranking-list { display: flex; flex-direction: column; gap: 24px; }
        .ranking-item { display: flex; flex-direction: column; }
        
        .ranking-info { display: flex; flex-direction: column; gap: 8px; }
        .ranking-header { display: flex; justify-content: space-between; align-items: baseline; }
        .ranking-main { display: flex; align-items: center; gap: 12px; }
        
        .rank-num { font-family: 'Outfit'; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); width: 24px; }
        .ranking-category { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
        .ranking-amount { font-family: 'Outfit'; font-size: 1rem; font-weight: 700; color: var(--color-text-primary); }
        
        .ranking-bar-container { height: 4px; background: var(--color-border); border-radius: 2px; overflow: hidden; }
        .ranking-bar { height: 100%; border-radius: 2px; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .ranking-percent-text { font-family: 'Outfit'; font-size: 0.7rem; color: var(--color-text-muted); text-align: right; }

        .no-data { text-align: center; padding: 40px 20px; color: var(--color-text-muted); font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
