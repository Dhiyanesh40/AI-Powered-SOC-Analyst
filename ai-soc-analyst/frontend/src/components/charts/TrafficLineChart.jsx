import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Generate 24 hourly mock data points
const generateTrafficData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0') + ':00';
    data.push({
      time: hour,
      inbound: Math.floor(Math.random() * 600) + 200,
      outbound: Math.floor(Math.random() * 450) + 150,
      threats: Math.floor(Math.random() * 50),
    });
  }
  return data;
};

const trafficData = generateTrafficData();

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
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
        <p style={{ color: '#94a3b8', marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              color: entry.color,
              margin: '4px 0',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: entry.color,
                display: 'inline-block',
              }}
            />
            {entry.name}: <strong style={{ marginLeft: 4 }}>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TrafficLineChart = () => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={trafficData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradientInbound" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientOutbound" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientThreats" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="time"
            stroke="#64748B"
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickLine={{ stroke: '#64748B' }}
          />
          <YAxis
            stroke="#64748B"
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickLine={{ stroke: '#64748B' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#94a3b8', fontSize: 13, paddingTop: 8 }}
          />
          <Area
            type="monotone"
            dataKey="inbound"
            name="Inbound"
            stroke="#06b6d4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#gradientInbound)"
          />
          <Area
            type="monotone"
            dataKey="outbound"
            name="Outbound"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#gradientOutbound)"
          />
          <Area
            type="monotone"
            dataKey="threats"
            name="Threats"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#gradientThreats)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficLineChart;
