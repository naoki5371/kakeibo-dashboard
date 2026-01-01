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

  return (
    <div className="pie-tooltip">
      <div className="pie-tooltip-header">
        <span
          className="pie-tooltip-dot"
          style={{ background: data.color }}
        />
        <span className="pie-tooltip-category">{data.category}</span>
      </div>
      <div className="pie-tooltip-amount">{formatCurrency(data.amount)}</div>
      <div className="pie-tooltip-percent">{data.percentage.toFixed(1)}%</div>

      <style>{`
        .pie-tooltip {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          box-shadow: var(--shadow-lg);
          min-width: 140px;
        }

        .pie-tooltip-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .pie-tooltip-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .pie-tooltip-category {
          font-weight: 500;
          color: var(--color-text-primary);
          font-size: 0.9rem;
        }

        .pie-tooltip-amount {
          font-family: 'Outfit', monospace;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .pie-tooltip-percent {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderCustomLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (percent < 0.05) return null; // 5%未満は表示しない
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// データをRechartsが期待する形式に変換
interface ChartDataItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

export function CategoryPieChart({ data, title = '今月のカテゴリ別支出' }: CategoryPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  // データを変換
  const chartData: ChartDataItem[] = data.map(item => ({
    ...item,
  }));

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
            <span className="pie-chart-total-label">合計</span>
            <span className="pie-chart-total-amount">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="pie-chart-legend">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="legend-item">
              <span className="legend-dot" style={{ background: item.color }} />
              <span className="legend-category">{item.category}</span>
              <span className="legend-amount">{formatCurrency(item.amount)}</span>
            </div>
          ))}
          {data.length > 6 && (
            <div className="legend-more">
              他 {data.length - 6} カテゴリ
            </div>
          )}
        </div>
      </div>

      <style>{`
        .category-pie-chart {
          min-height: 400px;
        }

        .pie-chart-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .pie-chart-container {
          position: relative;
        }

        .pie-chart-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .pie-chart-total-label {
          display: block;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-bottom: 4px;
        }

        .pie-chart-total-amount {
          font-family: 'Outfit', monospace;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .pie-chart-legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: var(--color-bg-primary);
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
        }

        .legend-item:hover {
          background: var(--color-bg-hover);
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-category {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          flex: 1;
        }

        .legend-amount {
          font-family: 'Outfit', monospace;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .legend-more {
          text-align: center;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          padding: 8px;
        }
      `}</style>
    </div>
  );
}
