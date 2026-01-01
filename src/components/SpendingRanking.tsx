import { Trophy, Medal } from 'lucide-react';
import type { CategoryData } from '../types';
import { formatCurrency } from '../utils/dataProcessor';

interface SpendingRankingProps {
  data: CategoryData[];
}

export function SpendingRanking({ data }: SpendingRankingProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={18} className="rank-icon gold" />;
    if (rank === 2) return <Medal size={18} className="rank-icon silver" />;
    if (rank === 3) return <Medal size={18} className="rank-icon bronze" />;
    return <span className="rank-number">{rank}</span>;
  };

  return (
    <div className="card spending-ranking">
      <h3 className="card-title">
        <Trophy size={20} />
        今月の支出TOP5
      </h3>

      <div className="ranking-list">
        {data.length === 0 ? (
          <div className="no-data">データがありません</div>
        ) : (
          data.slice(0, 5).map((item, index) => (
            <div key={index} className="ranking-item">
              <div className="ranking-position">
                {getRankIcon(index + 1)}
              </div>
              
              <div className="ranking-content">
                <div className="ranking-header">
                  <span
                    className="ranking-dot"
                    style={{ background: item.color }}
                  />
                  <span className="ranking-category">{item.category}</span>
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
              </div>
              
              <div className="ranking-stats">
                <span className="ranking-amount">{formatCurrency(item.amount)}</span>
                <span className="ranking-percent">{item.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .spending-ranking {
          min-height: 320px;
        }

        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ranking-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ranking-position {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rank-icon {
          width: 24px;
          height: 24px;
        }

        .rank-icon.gold {
          color: #FFD700;
        }

        .rank-icon.silver {
          color: #C0C0C0;
        }

        .rank-icon.bronze {
          color: #CD7F32;
        }

        .rank-number {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-hover);
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        .ranking-content {
          flex: 1;
          min-width: 0;
        }

        .ranking-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .ranking-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .ranking-category {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ranking-bar-container {
          height: 6px;
          background: var(--color-bg-primary);
          border-radius: 3px;
          overflow: hidden;
        }

        .ranking-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .ranking-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          flex-shrink: 0;
          min-width: 80px;
        }

        .ranking-amount {
          font-family: 'Outfit', monospace;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .ranking-percent {
          font-size: 0.75rem;
          color: var(--color-text-muted);
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

