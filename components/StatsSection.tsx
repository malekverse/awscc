'use client';

import { 
  Users, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Download, 
  Mail, 
  Settings 
} from 'lucide-react';
import { DashboardStats, Member } from '../types/dashboard';

interface StatsSectionProps {
  stats: DashboardStats | null;
  filteredMembers: Member[];
  onExportData: (format: string) => void;
  onShowEmailModal: () => void;
  onViewAllMembers: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }: {
  title: string;
  value: string | number;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}) => {
  const colorClasses = {
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200'
  };

  const iconColorClasses = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };

  return (
    <div className={`bg-white rounded-xl border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-4 w-4 mr-1 ${
                trend === 'up' ? 'text-green-500' : 
                trend === 'down' ? 'text-red-500' : 'text-gray-500'
              }`} />
              <span className={`text-sm ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className={`h-6 w-6 ${iconColorClasses[color]}`} />
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ title, description, icon: Icon }: {
  title: string;
  description: string;
  icon: any;
}) => (
  <div className="text-center py-12">
    <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);

export default function StatsSection({
  stats,
  filteredMembers,
  onExportData,
  onShowEmailModal,
  onViewAllMembers,
  formatCurrency,
  formatDate
}: StatsSectionProps) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon={Users}
            trend="up"
            trendValue="+12% from last month"
            color="primary"
          />
          <StatCard
            title="Paid Members"
            value={stats.paidMembers}
            icon={CheckCircle}
            trend="up"
            trendValue="+8% from last month"
            color="success"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            trend="up"
            trendValue="+15% from last month"
            color="success"
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate.toFixed(1)}%`}
            icon={TrendingUp}
            trend={stats.conversionRate > 60 ? 'up' : 'down'}
            trendValue={`${stats.conversionRate > 60 ? '+' : '-'}3% from last month`}
            color={stats.conversionRate > 60 ? 'success' : 'warning'}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Add Member</span>
          </button>
          <button 
            onClick={() => onExportData('csv')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Export Data</span>
          </button>
          <button 
            onClick={onShowEmailModal}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Send Emails</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="h-5 w-5 text-gray-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Settings</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Members</h3>
          <button 
            onClick={onViewAllMembers}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
          </button>
        </div>
        
        {filteredMembers.length > 0 ? (
          <div className="space-y-4">
            {filteredMembers.slice(0, 5).map((member) => (
              <div key={member._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {member.fullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.paid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.paid ? 'Paid' : 'Unpaid'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(member.submissionDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No members yet"
            description="Members will appear here once they register"
            icon={Users}
          />
        )}
      </div>
    </div>
  );
}