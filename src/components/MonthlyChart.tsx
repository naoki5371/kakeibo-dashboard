import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { MonthlyData } from '../types';
import { formatCurrency } from '../utils/dataProcessor';

interface MonthlyChartProps {
  data: MonthlyData[];
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const income = payload.find(p => p.dataKey === 'income')?.value || 0;
  const expense = payload.find(p => p.dataKey === 'expense')?.value || 0;
  const balance = income - expense;

  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      <div className="tooltip-row">
        <span className="tooltip-dot income" />
        <span>収入</span>
        <span className="tooltip-value income">{formatCurrency(income)}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-dot expense" />
        <span>支出</span>
        <span className="tooltip-value expense">{formatCurrency(expense)}</span>
      </div>
      <div className="tooltip-divider" />
      <div className="tooltip-row">
        <span>収支</span>
        <span className={`tooltip-value ${balance >= 0 ? 'positive' : 'negative'}`}>
          {formatCurrency(balance)}
        </span>
      </div>

      <style>{`
        .chart-tooltip {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          box-shadow: var(--shadow-lg);
        }

        .tooltip-label {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 10px;
          font-size: 0.9rem;
        }

        .tooltip-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          margin-bottom: 6px;
        }

        .tooltip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .tooltip-dot.income {
          background: var(--color-income);
        }

        .tooltip-dot.expense {
          background: var(--color-expense);
        }

        .tooltip-value {
          margin-left: auto;
          font-family: 'Outfit', monospace;
          font-weight: 600;
        }

        .tooltip-value.income {
          color: var(--color-income);
        }

        .tooltip-value.expense {
          color: var(--color-expense);
        }

        .tooltip-value.positive {
          color: var(--color-balance-positive);
        }

        .tooltip-value.negative {
          color: var(--color-balance-negative);
        }

        .tooltip-divider {
          height: 1px;
          background: var(--color-border);
          margin: 8px 0;
        }
      `}</style>
    </div>
  );
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="card monthly-chart">
      <h3 className="card-title">
        <BarChart3 size={20} />
        月別収支
      </h3>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  {value}
                </span>
              )}
            />
            <ReferenceLine y={0} stroke="var(--color-border)" />
            <Bar
              dataKey="income"
              name="収入"
              fill="var(--color-income)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="expense"
              name="支出"
              fill="var(--color-expense)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .monthly-chart {
          grid-column: span 2;
        }

        .chart-container {
          margin: 0 -12px;
        }

        @media (max-width: 768px) {
          .monthly-chart {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}

