import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, subMonths, addMonths, startOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const handlePrevMonth = () => {
    onMonthChange(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(selectedMonth, 1);
    const now = new Date();
    // 未来の月は選択できないようにする
    if (nextMonth <= startOfMonth(addMonths(now, 1))) {
      onMonthChange(nextMonth);
    }
  };

  const handleCurrentMonth = () => {
    onMonthChange(startOfMonth(new Date()));
  };

  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');
  const canGoNext = addMonths(selectedMonth, 1) <= startOfMonth(addMonths(new Date(), 1));

  return (
    <div className="month-selector">
      <button
        className="month-nav-btn"
        onClick={handlePrevMonth}
        title="前月"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="month-display">
        <Calendar size={18} />
        <span className="month-text">
          {format(selectedMonth, 'yyyy年 M月', { locale: ja })}
        </span>
      </div>

      <button
        className="month-nav-btn"
        onClick={handleNextMonth}
        disabled={!canGoNext}
        title="次月"
      >
        <ChevronRight size={20} />
      </button>

      {!isCurrentMonth && (
        <button
          className="current-month-btn"
          onClick={handleCurrentMonth}
        >
          今月に戻る
        </button>
      )}

      <style>{`
        .month-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .month-nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .month-nav-btn:hover:not(:disabled) {
          background: var(--color-bg-hover);
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
        }

        .month-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .month-display {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          min-width: 160px;
          justify-content: center;
        }

        .month-display svg {
          color: var(--color-accent-primary);
        }

        .month-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .current-month-btn {
          padding: 8px 16px;
          font-size: 0.85rem;
          font-weight: 500;
          background: var(--color-bg-hover);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-left: 8px;
        }

        .current-month-btn:hover {
          background: var(--color-accent-primary);
          border-color: var(--color-accent-primary);
          color: #0f1419;
        }

        @media (max-width: 600px) {
          .month-selector {
            padding: 8px 12px;
          }

          .month-display {
            min-width: 120px;
            padding: 0 8px;
          }

          .month-text {
            font-size: 0.95rem;
          }

          .current-month-btn {
            padding: 6px 12px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}

