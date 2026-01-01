import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { TrendData } from '../types';
import { formatCurrency } from '../utils/dataProcessor';

interface MonthlyTrendProps {
  data: TrendData[];
}

// カテゴリごとの色
const CATEGORY_COLORS: string[] = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

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

  return (
    <div className="trend-tooltip">
      <p className="tooltip-label">{label}</p>
      <div className="tooltip-items">
        {payload
          .filter(p => typeof p.value === 'number' && p.value > 0)
          .sort((a, b) => (b.value as number) - (a.value as number))
          .map((item, index) => (
            <div key={index} className="tooltip-item">
              <span
                className="tooltip-dot"
                style={{ background: item.color }}
              />
              <span className="tooltip-category">{item.dataKey}</span>
              <span className="tooltip-value">
                {formatCurrency(item.value as number)}
              </span>
            </div>
          ))}
      </div>

      <style>{`
        .trend-tooltip {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          box-shadow: var(--shadow-lg);
          max-width: 240px;
        }

        .tooltip-label {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 10px;
          font-size: 0.9rem;
        }

        .tooltip-items {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tooltip-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
        }

        .tooltip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .tooltip-category {
          color: var(--color-text-secondary);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tooltip-value {
          font-family: 'Outfit', monospace;
          font-weight: 500;
          color: var(--color-text-primary);
        }
      `}</style>
    </div>
  );
}

export function MonthlyTrend({ data }: MonthlyTrendProps) {
  // データからカテゴリを抽出（month以外のキー）
  const categories = data.length > 0
    ? Object.keys(data[0]).filter(key => key !== 'month')
    : [];

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
    <div className="card monthly-trend">
      <h3 className="card-title">
        <TrendingUp size={20} />
        カテゴリ別月間推移
      </h3>

      <div className="trend-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
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
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                  {value}
                </span>
              )}
            />
            {categories.slice(0, 6).map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length], strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .monthly-trend {
          grid-column: span 2;
        }

        .trend-chart-container {
          margin: 0 -12px;
        }

        @media (max-width: 768px) {
          .monthly-trend {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}

