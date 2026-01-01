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
        .pie-tooltip { background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px 16px; box-shadow: var(--shadow-lg); min-width: 140px; }
        .pie-tooltip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .pie-tooltip-dot { width: 10px; height: 10px; border-radius: 50%; }
        .pie-tooltip-category { font-weight: 500; color: var(--color-text-primary); font-size: 0.9rem; }
        .pie-tooltip-amount { font-family: 'Outfit', monospace; font-size: 1.1rem; font-weight: 600; color: var(--color-text-primary); }
        .pie-tooltip-percent { font-size: 0.8rem; color: var(--color-text-muted); margin-top: 4px; }
      `}</style>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderCustomLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (percent < 0.05) return null;
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

interface ChartDataItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

export function CategoryPieChart({ data, title = '今月のカテゴリ別支出' }: CategoryPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  // 1. 円グラフ用：支出があるものだけ抽出し、金額の多い順にソートする
  const chartData: ChartDataItem[] = data
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map(item => ({ ...item }));

  // 2. リスト用：元のデータ（番号順 01-14）をそのまま使う

  return (
    <div className="card category-pie-chart">
      <h3 className="card-title">
        <PieChartIcon size={20} />
        {title}
      </h3>

      <div className="pie-chart-content">
        <div className="pie-chart-container">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="amount"
                labelLine={false}
                label={renderCustomLabel}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-chart-center">
            <span className="pie-chart-total-label">総支出</span>
            <span className="pie-chart-total-amount">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="category-list-container">
          <h4 className="list-title">カテゴリ別内訳</h4>
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
        .category-pie-chart { min-height: 500px; grid-column: span 1; }
        .pie-chart-content { display: flex; flex-direction: column; gap: 32px; }
        .pie-chart-container { position: relative; }
        .pie-chart-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
        .pie-chart-total-label { display: block; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px; }
        .pie-chart-total-amount { font-family: 'Outfit', monospace; font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); }

        .category-list-container { border-top: 1px solid var(--color-border); padding-top: 24px; }
        .list-title { font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 16px; }
        .category-full-list { display: flex; flex-direction: column; gap: 8px; max-height: 450px; overflow-y: auto; padding-right: 8px; }
        
        .category-full-list::-webkit-scrollbar { width: 4px; }
        .category-full-list::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }

        .category-list-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--color-bg-primary); border-radius: var(--radius-md); border: 1px solid transparent; transition: all 0.2s ease; }
        .category-list-item:hover { background: var(--color-bg-hover); border-color: var(--color-border); }
        .category-list-item.zero-amount { opacity: 0.5; }
        
        .category-info { display: flex; align-items: center; gap: 12px; }
        .category-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .category-name { font-size: 0.9rem; font-weight: 500; color: var(--color-text-primary); }
        
        .category-values { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .category-amount { font-family: 'Outfit', monospace; font-size: 0.95rem; font-weight: 600; color: var(--color-text-primary); }
        .category-percent { font-size: 0.75rem; color: var(--color-text-muted); }

        @media (max-width: 768px) {
          .category-pie-chart { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
