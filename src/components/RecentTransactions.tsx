import { Receipt } from 'lucide-react';
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
        <Receipt size={20} strokeWidth={1.5} />
        直近の支出
      </h3>

      <div className="transactions-container">
        <div className="transactions-list">
          {data.length === 0 ? (
            <div className="no-data">支出データがありません</div>
          ) : (
            data.map((transaction, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-content">
                  <div className="transaction-main">
                    <span className="transaction-item-name">
                      {transaction.item || '(項目なし)'}
                    </span>
                    <span className="transaction-amount">
                      -{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  <div className="transaction-meta">
                    <span className="transaction-date">{transaction.date}</span>
                    <span className="transaction-category">
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
        .transactions-container { flex: 1; max-height: 450px; overflow-y: auto; padding-right: 12px; margin-top: 8px; }
        
        /* スクロールバーのデザイン */
        .transactions-container::-webkit-scrollbar { width: 4px; }
        .transactions-container::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }

        .transactions-list { display: flex; flex-direction: column; gap: 4px; }
        .transaction-item { padding: 16px 0; border-bottom: 1px solid var(--color-border); transition: opacity 0.2s ease; }
        .transaction-item:last-child { border-bottom: none; }
        .transaction-item:hover { opacity: 0.7; }
        
        .transaction-content { display: flex; flex-direction: column; gap: 6px; }
        .transaction-main { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
        .transaction-item-name { font-size: 0.95rem; font-weight: 500; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .transaction-amount { font-family: 'Outfit'; font-size: 1rem; font-weight: 600; color: var(--color-text-primary); flex-shrink: 0; }
        
        .transaction-meta { display: flex; align-items: center; justify-content: space-between; }
        .transaction-date { font-family: 'Outfit'; font-size: 0.75rem; color: var(--color-text-muted); }
        .transaction-category { font-size: 0.75rem; color: var(--color-text-secondary); background: var(--color-bg-primary); padding: 2px 8px; border-radius: 4px; }
        
        .no-data { text-align: center; padding: 60px 20px; color: var(--color-text-muted); font-size: 0.9rem; }

        @media print {
          .transactions-container { max-height: none !important; overflow: visible !important; }
        }
      `}</style>
    </div>
  );
}
