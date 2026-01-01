import { Calendar, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/dataProcessor';

interface YearlySummaryProps {
  data: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    averageMonthlyIncome: number;
    averageMonthlyExpense: number;
    monthsWithData: number;
  };
  year?: number;
}

export function YearlySummary({ data, year }: YearlySummaryProps) {
  const currentYear = year || new Date().getFullYear();

  return (
    <div className="card yearly-summary">
      <h3 className="card-title">
        <Calendar size={20} />
        {currentYear}年 年間サマリー
      </h3>

      <div className="summary-grid">
        <div className="summary-item income">
          <div className="summary-icon">
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">年間収入</span>
            <span className="summary-value amount-income">
              {formatCurrency(data.totalIncome)}
            </span>
            <span className="summary-sub">
              月平均 {formatCurrency(data.averageMonthlyIncome)}
            </span>
          </div>
        </div>

        <div className="summary-item expense">
          <div className="summary-icon">
            <TrendingDown size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">年間支出</span>
            <span className="summary-value amount-expense">
              {formatCurrency(data.totalExpense)}
            </span>
            <span className="summary-sub">
              月平均 {formatCurrency(data.averageMonthlyExpense)}
            </span>
          </div>
        </div>

        <div className={`summary-item balance ${data.balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-icon">
            <Wallet size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">年間収支</span>
            <span className={`summary-value ${data.balance >= 0 ? 'amount-positive' : 'amount-negative'}`}>
              {formatCurrency(data.balance)}
            </span>
            <span className="summary-sub">
              {data.monthsWithData}ヶ月分のデータ
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .yearly-summary {
          grid-column: span 2;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .summary-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: var(--color-bg-primary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          transition: all var(--transition-normal);
        }

        .summary-item:hover {
          border-color: var(--color-border-hover);
          transform: translateY(-2px);
        }

        .summary-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .summary-item.income .summary-icon {
          background: rgba(0, 212, 170, 0.1);
          color: var(--color-income);
        }

        .summary-item.expense .summary-icon {
          background: rgba(255, 107, 157, 0.1);
          color: var(--color-expense);
        }

        .summary-item.balance .summary-icon {
          background: rgba(124, 92, 255, 0.1);
          color: var(--color-accent-secondary);
        }

        .summary-item.balance.positive .summary-icon {
          background: rgba(0, 212, 170, 0.1);
          color: var(--color-income);
        }

        .summary-item.balance.negative .summary-icon {
          background: rgba(255, 107, 157, 0.1);
          color: var(--color-expense);
        }

        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .summary-value {
          font-family: 'Outfit', monospace;
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .summary-sub {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .yearly-summary {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}

