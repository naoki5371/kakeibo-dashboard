import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { MonthlyData } from '../types';
import { formatCurrency } from '../utils/dataProcessor';

interface MonthlyChartProps {
  data: MonthlyData[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <div className="card monthly-chart">
      <h3 className="card-title">
        <BarChart3 size={20} strokeWidth={1.5} />
        月別支出推移
      </h3>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fontWeight: 500 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fontWeight: 500 }}
              tickFormatter={(value) => `¥${(value / 1000).toLocaleString()}k`}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-bg-primary)', radius: 8 }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px 16px'
              }}
              formatter={(value: number) => [formatCurrency(value), '支出']}
              labelStyle={{ fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-primary)' }}
            />
            <Bar 
              dataKey="expense" 
              name="支出" 
              radius={[6, 6, 0, 0]} 
              barSize={32}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? 'var(--color-accent)' : 'var(--color-text-muted)'} 
                  fillOpacity={index === data.length - 1 ? 1 : 0.2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .monthly-chart { min-height: 450px; }
        .chart-container { margin-top: 32px; width: 100%; }
      `}</style>
    </div>
  );
}
