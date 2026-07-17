import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const severityData = [
  { name: 'Critical', value: 23, color: '#ef4444' },
  { name: 'High', value: 45, color: '#f97316' },
  { name: 'Medium', value: 67, color: '#eab308' },
  { name: 'Low', value: 89, color: '#3b82f6' },
  { name: 'Info', value: 34, color: '#6b7280' },
];

const total = severityData.reduce((sum, entry) => sum + entry.value, 0);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = ((data.value / total) * 100).toFixed(1);
    return (
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '12px 16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
        }}
      >
        <p
          style={{
            color: data.payload.color,
            margin: 0,
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: data.payload.color,
              display: 'inline-block',
            }}
          />
          {data.name}
        </p>
        <p style={{ color: '#cbd5e1', margin: '6px 0 0 0', fontSize: 13 }}>
          Count: <strong>{data.value}</strong> &nbsp;({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const CenterLabel = ({ viewBox }) => {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 28, fontWeight: 700, fill: '#f1f5f9' }}
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
      >
        Total Alerts
      </text>
    </g>
  );
};

const SeverityPieChart = () => {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={severityData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              label={false}
            >
              {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <CenterLabel />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom colored legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '12px 20px',
          marginTop: 8,
          padding: '0 8px',
        }}
      >
        {severityData.map((entry, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#94a3b8',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: entry.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span>{entry.name}</span>
            <span style={{ color: '#64748b', fontWeight: 600 }}>({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeverityPieChart;
