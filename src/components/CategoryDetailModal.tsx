import { X, Receipt } from 'lucide-react';
import type { CategoryTransaction } from '../utils/dataProcessor';
import { formatCurrency } from '../utils/dataProcessor';

interface CategoryDetailModalProps {
  category: string;
  monthLabel: string;
  color?: string;
  transactions: CategoryTransaction[];
  onClose: () => void;
}

export function CategoryDetailModal({
  category,
  monthLabel,
  color = 'var(--color-accent)',
  transactions,
  onClose,
}: CategoryDetailModalProps) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <div className="detail-title">
            <span className="detail-dot" style={{ background: color }} />
            <div>
              <div className="detail-month">{monthLabel}</div>
              <h2 className="detail-category">{category}</h2>
            </div>
          </div>
          <button className="detail-close" onClick={onClose} aria-label="閉じる">
            <X size={20} />
          </button>
        </div>

        <div className="detail-summary">
          <span className="detail-summary-label">合計（{transactions.length}件）</span>
          <span className="detail-summary-amount">{formatCurrency(total)}</span>
        </div>

        <div className="detail-list">
          {transactions.length === 0 ? (
            <div className="detail-empty">
              <Receipt size={32} strokeWidth={1.2} />
              <span>この月の支出はありません</span>
            </div>
          ) : (
            transactions.map((t, i) => (
              <div key={i} className="detail-item">
                <div className="detail-item-left">
                  <span className="detail-item-date">{t.date}</span>
                  <span className="detail-item-name">{t.item}</span>
                </div>
                <span className="detail-item-amount">{formatCurrency(t.amount)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; animation: fadeIn 0.2s ease; }
        .detail-modal { width: 100%; max-width: 480px; max-height: 85vh; display: flex; flex-direction: column; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; animation: slideUp 0.25s ease; }
        .detail-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 22px; border-bottom: 1px solid var(--color-border); }
        .detail-title { display: flex; align-items: center; gap: 14px; }
        .detail-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
        .detail-month { font-size: 0.75rem; color: var(--color-text-muted); font-family: 'Outfit'; }
        .detail-category { font-size: 1.15rem; font-weight: 700; color: var(--color-text-primary); }
        .detail-close { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: transparent; border: none; border-radius: var(--radius-md); color: var(--color-text-secondary); cursor: pointer; transition: all var(--transition-fast); }
        .detail-close:hover { background: var(--color-bg-primary); }

        .detail-summary { display: flex; align-items: baseline; justify-content: space-between; padding: 16px 22px; background: var(--color-bg-primary); }
        .detail-summary-label { font-size: 0.8rem; color: var(--color-text-secondary); }
        .detail-summary-amount { font-family: 'Outfit'; font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); }

        .detail-list { overflow-y: auto; padding: 8px 22px 22px; }
        .detail-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--color-border); }
        .detail-item:last-child { border-bottom: none; }
        .detail-item-left { display: flex; align-items: baseline; gap: 14px; min-width: 0; }
        .detail-item-date { font-family: 'Outfit'; font-size: 0.8rem; color: var(--color-text-muted); flex-shrink: 0; }
        .detail-item-name { font-size: 0.95rem; color: var(--color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .detail-item-amount { font-family: 'Outfit'; font-size: 1rem; font-weight: 600; color: var(--color-text-primary); flex-shrink: 0; }

        .detail-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 20px; color: var(--color-text-muted); font-size: 0.9rem; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
