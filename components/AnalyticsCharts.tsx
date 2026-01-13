'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { AnalyticsData } from '../types/dashboard';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface AnalyticsChartsProps {
  analytics: AnalyticsData | null;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Custom tooltip component that supports dark mode
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-foreground font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!analytics) {
    return <LoadingSpinner />;
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <LoadingSpinner />;
  }

  const isDark = resolvedTheme === 'dark';
  
  // Theme-aware colors
  const colors = {
    primary: isDark ? '#60A5FA' : '#3B82F6',
    success: isDark ? '#34D399' : '#10B981',
    purple: isDark ? '#A78BFA' : '#8B5CF6',
    text: isDark ? '#F3F4F6' : '#374151',
    grid: isDark ? '#374151' : '#E5E7EB'
  };

  return (
    <div className="space-y-8">
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Monthly Registration vs Payment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: colors.text, fontSize: 12 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <YAxis 
                tick={{ fill: colors.text, fontSize: 12 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="registered" fill={colors.primary} name="Registered" radius={[4, 4, 0, 0]} />
              <Bar dataKey="paid" fill={colors.success} name="Paid" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Payment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.paymentStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill={colors.primary}
                dataKey="value"
                style={{ fontSize: '12px', fill: colors.text }}
              >
                {analytics.paymentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Registration Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.registrationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: colors.text, fontSize: 12 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <YAxis 
                tick={{ fill: colors.text, fontSize: 12 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={colors.primary} 
                strokeWidth={3}
                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2, fill: isDark ? '#1F2937' : '#FFFFFF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Top Organizations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.organizationStats} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} />
              <XAxis 
                type="number" 
                tick={{ fill: colors.text, fontSize: 12 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{ fill: colors.text, fontSize: 12 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={colors.purple} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}