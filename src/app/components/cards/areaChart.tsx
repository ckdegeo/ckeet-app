'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartDataPoint {
  [key: string]: string | number;
}

interface DataKey {
  key: string;
  name: string;
  color: string;
  type: 'area' | 'line';
}

interface AreaChartCardProps {
  title: string;
  data: ChartDataPoint[];
  dataKeys: DataKey[];
  className?: string;
}

export default function AreaChartCard({
  title,
  data,
  dataKeys,
  className = "",
}: AreaChartCardProps) {
  return (
    <div className={`
      border border-[var(--on-background)]
      rounded-2xl
      p-6
      bg-[var(--background)]
      ${className}
    `}>
      <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">
        {title}
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              {dataKeys.map((dataKey, index) => (
                dataKey.type === 'area' && (
                  <linearGradient key={index} id={`color${dataKey.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dataKey.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={dataKey.color} stopOpacity={0.1}/>
                  </linearGradient>
                )
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--on-background)" opacity={0.2} />
            <XAxis dataKey="name" stroke="var(--on-background)" />
            <YAxis stroke="var(--on-background)" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)', 
                borderColor: 'var(--on-background)',
                borderRadius: '8px'
              }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Legend />
            {dataKeys.map((dataKey, index) => (
              dataKey.type === 'area' ? (
                <Area 
                  key={index}
                  type="monotone" 
                  dataKey={dataKey.key} 
                  name={dataKey.name} 
                  stroke={dataKey.color} 
                  fillOpacity={1} 
                  fill={`url(#color${dataKey.key})`} 
                  activeDot={{ r: 6 }}
                />
              ) : (
                <Area 
                  key={index}
                  type="monotone" 
                  dataKey={dataKey.key} 
                  name={dataKey.name} 
                  stroke={dataKey.color} 
                  fill="transparent"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              )
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
