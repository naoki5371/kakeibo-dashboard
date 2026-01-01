import { Table } from 'lucide-react';
import type { CategoryMonthlyTableData } from '../utils/dataProcessor';
import { formatCurrency } from '../utils/dataProcessor';

interface CategoryMonthlyTableProps {
  data: CategoryMonthlyTableData;
  year: number;
}

export function CategoryMonthlyTable({ data, year }: CategoryMonthlyTableProps) {
  // 月ごとの合計を計算
  const monthlyTotals = data.months.map(month => {
    return data.rows.reduce((sum, row) => sum + (row.data[month] || 0), 0);
  });

  // 年間総合計を計算
  const grandTotal = data.rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="card category-monthly-table">
      <h3 className="card-title">
        <Table size={20} strokeWidth={1.5} />
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
            <tfoot>
              <tr className="grand-total-row">
                <td className="sticky-col total-label-cell">月間合計</td>
                {monthlyTotals.map((total, index) => (
                  <td key={index} className="amount-cell total-amount-cell">
                    {formatCurrency(total)}
                  </td>
                ))}
                <td className="total-cell final-total-cell">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <style>{`
        .category-monthly-table { margin-top: 24px; overflow: visible; width: 100%; border: none; }
        .table-wrapper { width: 100%; margin-top: 24px; border-radius: var(--radius-lg); border: 1px solid var(--color-border); background: white; overflow: hidden; }
        .table-container { overflow-x: auto; width: 100%; }
        
        .analysis-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left; table-layout: fixed; }
        
        .sticky-col { width: 150px; min-width: 150px; position: sticky; left: 0; background: white; border-right: 1px solid var(--color-border); z-index: 1; }
        .month-col { width: 90px; min-width: 90px; text-align: center; }
        .total-col { width: 110px; min-width: 110px; text-align: right; background: var(--color-bg-primary); font-weight: 700; }
        
        .analysis-table th { background: var(--color-bg-primary); padding: 16px 12px; font-weight: 700; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); white-space: nowrap; text-transform: uppercase; letter-spacing: 0.05em; }
        .analysis-table td { padding: 14px 12px; border-bottom: 1px solid var(--color-border); color: var(--color-text-primary); white-space: nowrap; }
        
        th.sticky-col { background: var(--color-bg-primary); z-index: 2; }
        
        .category-name-cell { font-weight: 600; font-size: 0.85rem; }
        .amount-cell { font-family: 'Outfit'; text-align: right; font-weight: 500; }
        .total-cell { font-family: 'Outfit'; text-align: right; font-weight: 700; background: var(--color-bg-primary); }
        
        .grand-total-row td { background: var(--color-bg-primary) !important; border-top: 2px solid var(--color-border); border-bottom: none; }
        .total-label-cell { font-weight: 800; color: var(--color-accent) !important; }
        .total-amount-cell { color: var(--color-accent) !important; font-weight: 700 !important; }
        .final-total-cell { color: var(--color-accent) !important; font-size: 0.9rem; }
        
        tr:hover td { background: var(--color-bg-primary) !important; }
        
        /* スクロールバーのデザイン */
        .table-container::-webkit-scrollbar { height: 6px; }
        .table-container::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }

        @media print {
          .category-monthly-table { break-inside: avoid; }
          .table-container { overflow: visible !important; }
          .analysis-table { table-layout: auto !important; width: 100% !important; font-size: 0.7rem !important; }
          .sticky-col { position: static !important; width: auto !important; min-width: 80px !important; }
          .month-col { width: auto !important; min-width: 40px !important; }
        }
      `}</style>
    </div>
  );
}
