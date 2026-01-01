import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import type { CategoryData } from '../types';
import { formatCurrency } from '../utils/dataProcessor';

interface CategoryPieChartProps {
  data: CategoryData[];
  title?: string;
}

interface TooltipPayload {
  payload: CategoryData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  if (data.amount === 0) return null;

  return (
    <div className="pie-tooltip">
      <div className="pie-tooltip-header">
        <span className="pie-tooltip-dot" style={{ background: data.color }} />
        <span className="pie-tooltip-category">{data.category}</span>
      </div>
      <div className="pie-tooltip-amount">{formatCurrency(data.amount)}</div>
      <div className="pie-tooltip-percent">{data.percentage.toFixed(1)}%</div>

      <style>{`
        .pie-tooltip { background: white; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 16px; box-shadow: var(--shadow-lg); min-width: 160px; }
        .pie-tooltip-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .pie-tooltip-dot { width: 8px; height: 8px; border-radius: 50%; }
        .pie-tooltip-category { font-weight: 600; color: var(--color-text-primary); font-size: 0.85rem; }
        .pie-tooltip-amount { font-family: 'Outfit'; font-size: 1.1rem; font-weight: 700; color: var(--color-text-primary); }
        .pie-tooltip-percent { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px; }
      `}</style>
    </div>
  );
}

interface ChartDataItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

export function CategoryPieChart({ data, title = 'カテゴリ別支出' }: CategoryPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  const chartData: ChartDataItem[] = data
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map(item => ({ ...item }));

  return (
    <div className="card category-pie-chart">
      <h3 className="card-title">
        <PieChartIcon size={20} strokeWidth={1.5} />
        {title}
      </h3>

      <div className="pie-chart-content">
        <div className="pie-chart-container">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={4}
                dataKey="amount"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-chart-center">
            <span className="pie-chart-total-label">Total</span>
            <span className="pie-chart-total-amount">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="category-list-container">
          <div className="category-full-list">
            {data.map((item, index) => (
              <div key={index} className={`category-list-item ${item.amount === 0 ? 'zero-amount' : ''}`}>
                <div className="category-info">
                  <span className="category-dot" style={{ background: item.color }} />
                  <span className="category-name">{item.category}</span>
                </div>
                <div className="category-values">
                  <span className="category-amount">{formatCurrency(item.amount)}</span>
                  <span className="category-percent">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .category-pie-chart { min-height: 500px; }
        .pie-chart-content { display: flex; flex-direction: column; gap: 40px; }
        .pie-chart-container { position: relative; }
        .pie-chart-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; }
        .pie-chart-total-label { display: block; font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
        .pie-chart-total-amount { font-family: 'Outfit'; font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary); }

        .category-list-container { border-top: 1px solid var(--color-border); padding-top: 32px; }
        .category-full-list { display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 8px; }
        
        /* スクロールバー */
        .category-full-list::-webkit-scrollbar { width: 4px; }
        .category-full-list::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }

        .category-list-item { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; transition: opacity 0.2s ease; }
        .category-list-item.zero-amount { opacity: 0.3; }
        
        .category-info { display: flex; align-items: center; gap: 12px; }
        .category-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .category-name { font-size: 0.85rem; font-weight: 500; color: var(--color-text-primary); }
        
        .category-values { display: flex; align-items: center; gap: 16px; }
        .category-amount { font-family: 'Outfit'; font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
        .category-percent { font-family: 'Outfit'; font-size: 0.75rem; color: var(--color-text-muted); min-width: 45px; text-align: right; }

        @media (max-width: 768px) {
          .category-pie-chart { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
