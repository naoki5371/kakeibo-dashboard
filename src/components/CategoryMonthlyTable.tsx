import { Table } from 'lucide-react';
import type { CategoryMonthlyTableData } from '../utils/dataProcessor';
import { formatCurrency } from '../utils/dataProcessor';

interface CategoryMonthlyTableProps {
  data: CategoryMonthlyTableData;
  year: number;
}

export function CategoryMonthlyTable({ data, year }: CategoryMonthlyTableProps) {
  return (
    <div className="card category-monthly-table">
      <h3 className="card-title">
        <Table size={20} />
        {year}年 カテゴリ別・月別支出推移表
      </h3>

      <div className="table-container">
        <table className="analysis-table">
          <thead>
            <tr>
              <th className="sticky-col">カテゴリ</th>
              {data.months.map(month => (
                <th key={month}>{month}</th>
              ))}
              <th className="total-col">年間合計</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, index) => (
              <tr key={index} className={row.total === 0 ? 'zero-row' : ''}>
                <td className="sticky-col category-name-cell">
                  <span className="category-label">{row.category}</span>
                </td>
                {data.months.map(month => (
                  <td key={month} className="amount-cell">
                    {formatCurrency(row.data[month] || 0)}
                  </td>
                ))}
                <td className="total-cell">
                  {formatCurrency(row.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .category-monthly-table { margin-top: 24px; overflow: hidden; }
        .table-container { overflow-x: auto; margin-top: 20px; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
        
        .analysis-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; background: white; }
        .analysis-table th { background: var(--color-bg-primary); padding: 12px 16px; font-weight: 600; color: var(--color-text-secondary); border-bottom: 2px solid var(--color-border); white-space: nowrap; }
        .analysis-table td { padding: 12px 16px; border-bottom: 1px solid var(--color-border); color: var(--color-text-primary); white-space: nowrap; }
        
        .sticky-col { position: sticky; left: 0; background: white; border-right: 1px solid var(--color-border); z-index: 1; }
        th.sticky-col { background: var(--color-bg-primary); z-index: 2; }
        
        .category-name-cell { font-weight: 500; }
        .amount-cell { font-family: 'Outfit', monospace; text-align: right; }
        .total-cell { font-family: 'Outfit', monospace; text-align: right; font-weight: 700; background: var(--color-bg-primary); }
        .total-col { background: var(--color-bg-primary); font-weight: 700; text-align: right; }
        
        .zero-row { opacity: 0.4; }
        .zero-row:hover { opacity: 1; }
        
        tr:hover td { background: var(--color-bg-hover) !important; }
        
        /* スクロールバーの調整 */
        .table-container::-webkit-scrollbar { height: 6px; }
        .table-container::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }

        @media print {
          .category-monthly-table { break-inside: avoid; }
          .sticky-col { position: static; border-right: 1px solid var(--color-border); }
        }
      `}</style>
    </div>
  );
}

