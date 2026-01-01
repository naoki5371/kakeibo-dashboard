import { Receipt, ArrowDownCircle } from 'lucide-react';
import { formatCurrency } from '../utils/dataProcessor';

interface Transaction {
  date: string;
  item: string;
  category: string;
  amount: number;
  type: 'expense';
}

interface RecentTransactionsProps {
  data: Transaction[];
}

export function RecentTransactions({ data }: RecentTransactionsProps) {
  return (
    <div className="card recent-transactions">
      <h3 className="card-title">
        <Receipt size={20} />
        直近の支出
      </h3>

      <div className="transactions-container">
        <div className="transactions-list">
          {data.length === 0 ? (
            <div className="no-data">支出データがありません</div>
          ) : (
            data.map((transaction, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-icon expense">
                  <ArrowDownCircle size={20} />
                </div>

                <div className="transaction-content">
                  <div className="transaction-main">
                    <span className="transaction-item-name">
                      {transaction.item || '(項目なし)'}
                    </span>
                    <span className="transaction-amount expense">
                      -{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  <div className="transaction-meta">
                    <span className="transaction-date">{transaction.date}</span>
                    <span className="transaction-badge expense">
                      {transaction.category}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .recent-transactions { min-height: 400px; display: flex; flex-direction: column; }
        .transactions-container { flex: 1; max-height: 450px; overflow-y: auto; padding-right: 8px; margin-top: 12px; }
        
        /* スクロールバーのデザイン */
        .transactions-container::-webkit-scrollbar { width: 4px; }
        .transactions-container::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }

        .transactions-list { display: flex; flex-direction: column; gap: 4px; }
        .transaction-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--color-bg-primary); border-radius: var(--radius-md); border: 1px solid transparent; transition: all var(--transition-fast); }
        .transaction-item:hover { border-color: var(--color-border); background: var(--color-bg-hover); }
        .transaction-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); flex-shrink: 0; }
        .transaction-icon.expense { background: rgba(244, 63, 94, 0.1); color: var(--color-expense); }
        .transaction-content { flex: 1; min-width: 0; }
        .transaction-main { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 6px; }
        .transaction-item-name { font-size: 0.9rem; font-weight: 500; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .transaction-amount { font-family: 'Outfit', monospace; font-size: 0.95rem; font-weight: 600; flex-shrink: 0; }
        .transaction-amount.expense { color: var(--color-expense); }
        .transaction-meta { display: flex; align-items: center; gap: 10px; }
        .transaction-date { font-size: 0.75rem; color: var(--color-text-muted); }
        .transaction-badge { font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; }
        .transaction-badge.expense { background: rgba(244, 63, 94, 0.1); color: var(--color-expense); }
        .no-data { text-align: center; padding: 40px 20px; color: var(--color-text-muted); font-size: 0.9rem; }

        @media print {
          .transactions-container { max-height: none !important; overflow: visible !important; }
        }
      `}</style>
    </div>
  );
}
