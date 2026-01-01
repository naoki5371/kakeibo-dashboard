import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GitCompare } from 'lucide-react';
import type { MonthComparisonData } from '../types';
import { formatCurrency } from '../utils/dataProcessor';

interface MonthComparisonProps {
  data: MonthComparisonData[];
  currentMonthLabel: string;
  previousMonthLabel: string;
}

export function MonthComparison({ data, currentMonthLabel, previousMonthLabel }: MonthComparisonProps) {
  // 支出があるカテゴリのみ表示（見やすさのため）
  const chartData = data
    .filter(item => item.currentMonth > 0 || item.previousMonth > 0)
    .map(item => ({
      name: item.category,
      [previousMonthLabel]: item.previousMonth,
      [currentMonthLabel]: item.currentMonth,
      diff: item.difference
    }));

  return (
    <div className="card month-comparison">
      <h3 className="card-title">
        <GitCompare size={20} strokeWidth={1.5} />
        {currentMonthLabel} vs {previousMonthLabel}
      </h3>

      <div className="comparison-chart-container">
        <ResponsiveContainer width="100%" height={chartData.length * 60 + 100}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--color-text-primary)' }}
              width={100}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-bg-primary)', opacity: 0.4 }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px'
              }}
              formatter={(value: number) => [formatCurrency(value), '']}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }}
            />
            <Bar 
              dataKey={previousMonthLabel} 
              fill="var(--color-text-muted)" 
              fillOpacity={0.2} 
              radius={[0, 4, 4, 0]} 
              barSize={12}
            />
            <Bar 
              dataKey={currentMonthLabel} 
              fill="var(--color-accent)" 
              radius={[0, 4, 4, 0]} 
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .month-comparison { min-height: 400px; }
        .comparison-chart-container { margin-top: 24px; width: 100%; }
        
        @media print {
          .month-comparison { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
