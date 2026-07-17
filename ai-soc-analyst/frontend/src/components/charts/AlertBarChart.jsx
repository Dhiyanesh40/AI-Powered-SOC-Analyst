import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const alertData = [
  { name: 'DDoS', count: 45, color: '#ef4444' },
  { name: 'SQL Injection', count: 32, color: '#f97316' },
  { name: 'XSS', count: 28, color: '#eab308' },
  { name: 'Phishing', count: 56, color: '#22c55e' },
  { name: 'Brute Force', count: 38, color: '#3b82f6' },
  { name: 'Malware', count: 21, color: '#8b5cf6' },
  { name: 'Ransomware', count: 15, color: '#ec4899' },
  { name: 'MitM', count: 8, color: '#06b6d4' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
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
          {label}
        </p>
        <p style={{ color: '#cbd5e1', margin: '6px 0 0 0', fontSize: 13 }}>
          Alerts: <strong>{data.value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const AlertBarChart = () => {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={alertData}
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="#64748B"
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickLine={{ stroke: '#64748B' }}
          />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#64748B"
            tick={{ fill: '#94a3b8', fontSize: 13 }}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51,65,85,0.3)' }} />
          <Bar dataKey="count" barSize={20} radius={[0, 4, 4, 0]}>
            {alertData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AlertBarChart;
