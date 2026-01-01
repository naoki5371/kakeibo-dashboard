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

      <div className="table-wrapper">
        <div className="table-container">
          <table className="analysis-table">
            <thead>
              <tr>
                <th className="sticky-col">カテゴリ</th>
                {data.months.map(month => (
                  <th key={month} className="month-col">{month}</th>
                ))}
                <th className="total-col">年間合計</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, index) => (
                <tr key={index}>
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
      </div>

      <style>{`
        .category-monthly-table { margin-top: 24px; overflow: visible; width: 100%; }
        .table-wrapper { width: 100%; margin-top: 20px; border-radius: var(--radius-md); border: 1px solid var(--color-border); background: white; }
        .table-container { overflow-x: auto; width: 100%; }
        
        .analysis-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; table-layout: fixed; }
        
        /* 列の幅を固定 */
        .sticky-col { width: 140px; min-width: 140px; position: sticky; left: 0; background: white; border-right: 1px solid var(--color-border); z-index: 1; }
        .month-col { width: 85px; min-width: 85px; text-align: center; }
        .total-col { width: 100px; min-width: 100px; text-align: right; background: var(--color-bg-primary); }
        
        .analysis-table th { background: var(--color-bg-primary); padding: 12px 8px; font-weight: 600; color: var(--color-text-secondary); border-bottom: 2px solid var(--color-border); white-space: nowrap; }
        .analysis-table td { padding: 12px 8px; border-bottom: 1px solid var(--color-border); color: var(--color-text-primary); white-space: nowrap; }
        
        th.sticky-col { background: var(--color-bg-primary); z-index: 2; }
        
        .category-name-cell { font-weight: 500; }
        .amount-cell { font-family: 'Outfit', monospace; text-align: right; }
        .total-cell { font-family: 'Outfit', monospace; text-align: right; font-weight: 700; background: var(--color-bg-primary); }
        
        tr:hover td { background: var(--color-bg-hover) !important; }
        
        /* スクロールバーの調整 */
        .table-container::-webkit-scrollbar { height: 8px; }
        .table-container::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

        @media print {
          .category-monthly-table { break-inside: avoid; }
          .table-container { overflow: visible !important; width: 100% !important; }
          .analysis-table { table-layout: fixed !important; width: 100% !important; font-size: 0.75rem !important; border: 1px solid #e2e8f0 !important; }
          .sticky-col { position: static !important; width: 120px !important; min-width: 120px !important; border-right: 1px solid #e2e8f0 !important; }
          .month-col { width: 75px !important; min-width: 75px !important; }
          .total-col { width: 90px !important; min-width: 90px !important; }
          .analysis-table th, .analysis-table td { padding: 8px 4px !important; border: 1px solid #e2e8f0 !important; }
        }
      `}</style>
    </div>
  );
}
