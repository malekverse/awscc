'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  CreditCard,
  Mail,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  BarChart3,
  TrendingUp,
  UserCheck,
  DollarSign,
  Activity,
  Check,
  X,
  Shield
} from 'lucide-react';
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
  Line,
  Area,
  AreaChart
} from 'recharts';

interface Member {
  _id: string;
  fullName: string;
  email: string;
  organization?: string;
  paid: boolean;
  emailSent: boolean;
  paidDate?: string;
  paidBy?: string;
  submissionDate: string;
  lastLogin?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface AdminInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AnalyticsData {
  registrationTrend: Array<{ date: string; count: number }>;
  paymentStatus: Array<{ name: string; value: number; color: string }>;
  organizationStats: Array<{ name: string; count: number }>;
  monthlyStats: Array<{ month: string; registered: number; paid: number }>;
}

export default function AdminDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paidFilter, setPaidFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('submissionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{show: boolean, memberId: string, action: string} | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'analytics'>('overview');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const router = useRouter();

  // Fetch members data
  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        sortBy,
        sortOrder
      });
      
      if (paidFilter !== 'all') {
        params.append('paid', paidFilter);
      }

      const response = await fetch(`/api/admin/members?${params}`);
      
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.data.members);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const exportData = async (format: 'csv' | 'excel') => {
    try {
      const response = await fetch(`/api/admin/export?format=${format}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `members.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Handle member payment status toggle
  const handlePaymentToggle = async (memberId: string, currentStatus: boolean) => {
    setActionLoading(memberId);
    try {
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paid: !currentStatus }),
      });

      if (response.ok) {
        await fetchMembers(); // Refresh the list
      } else {
        console.error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setActionLoading(null);
      setShowConfirmDialog(null);
    }
  };

  // Handle member deletion
  const handleDeleteMember = async (memberId: string) => {
    setActionLoading(memberId);
    try {
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMembers(); // Refresh the list
      } else {
        console.error('Failed to delete member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    } finally {
      setActionLoading(null);
      setShowConfirmDialog(null);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin/login');
    }
  };

  // Check authentication and fetch initial data
  useEffect(() => {
    fetchMembers();
    if (activeTab === 'analytics' || activeTab === 'overview') {
      fetchAnalytics();
    }
  }, [currentPage, searchTerm, paidFilter, activeTab]);

  const handleBulkAction = async (action: 'paid' | 'unpaid' | 'delete') => {
    if (selectedMembers.length === 0) return;

    try {
      setActionLoading('bulk');
      const response = await fetch('/api/admin/members/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          memberIds: selectedMembers,
          action
        })
      });

      if (response.ok) {
        await fetchMembers();
        setSelectedMembers([]);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleSelectAll = () => {
     setSelectedMembers(prev => 
       prev.length === members.length ? [] : members.map(m => m._id)
     );
   };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {admin?.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => exportData('csv')}
                className="inline-flex items-center px-3 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-background hover:bg-secondary transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] hover:opacity-90 transition-opacity"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'members', name: 'Members', icon: Users },
                { id: 'analytics', name: 'Analytics', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-foreground/70 hover:text-foreground hover:border-border'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-muted-foreground truncate">
                          Total Members
                        </dt>
                        <dd className="text-lg font-medium text-foreground">
                          {pagination?.totalCount || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-accent" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-muted-foreground truncate">
                          Paid Members
                        </dt>
                        <dd className="text-lg font-medium text-foreground">
                          {members.filter(m => m.paid).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-muted-foreground truncate">
                          Active Rate
                        </dt>
                        <dd className="text-lg font-medium text-foreground">
                          {pagination?.totalCount ? Math.round((members.filter(m => m.paid).length / pagination.totalCount) * 100) : 0}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-muted-foreground truncate">
                          Recent Activity
                        </dt>
                        <dd className="text-lg font-medium text-foreground">
                          {members.filter(m => {
                            const today = new Date();
                            const memberDate = new Date(m.submissionDate);
                            const diffTime = Math.abs(today.getTime() - memberDate.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays <= 7;
                          }).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Charts */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg shadow border border-border">
                  <h3 className="text-lg font-medium text-foreground mb-4">Payment Status</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analytics.paymentStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {analytics.paymentStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-card p-6 rounded-lg shadow border border-border">
                  <h3 className="text-lg font-medium text-foreground mb-4">Registration Trend</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={analytics.registrationTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">

            {/* Enhanced Filters and Search */}
            <div className="bg-card shadow rounded-lg border border-border mb-6">
              <div className="px-6 py-4 border-b border-border">
                <div className="flex flex-col space-y-4">
                  {/* Primary Search and Filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by name, email, or organization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:placeholder-muted-foreground/70 focus:ring-1 focus:ring-ring focus:border-ring"
                      />
                    </div>
                    
                    {/* Primary Filters */}
                    <div className="flex space-x-4">
                      <select
                        value={paidFilter}
                        onChange={(e) => setPaidFilter(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-input bg-background text-foreground focus:outline-none focus:ring-ring focus:border-ring rounded-md"
                      >
                        <option value="all">All Members</option>
                        <option value="true">Paid Only</option>
                        <option value="false">Unpaid Only</option>
                      </select>
                      
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [field, order] = e.target.value.split('-');
                          setSortBy(field);
                          setSortOrder(order);
                        }}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-input bg-background text-foreground focus:outline-none focus:ring-ring focus:border-ring rounded-md"
                      >
                        <option value="submissionDate-desc">Newest First</option>
                        <option value="submissionDate-asc">Oldest First</option>
                        <option value="fullName-asc">Name A-Z</option>
                        <option value="fullName-desc">Name Z-A</option>
                        <option value="paid-desc">Paid First</option>
                        <option value="paid-asc">Unpaid First</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Additional Filters */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">Additional Filters:</span>
                    </div>
                    
                    <select
                      className="px-3 py-1 border border-input bg-background text-foreground rounded-md focus:ring-1 focus:ring-ring focus:border-ring text-sm"
                      onChange={(e) => {
                        // Add organization filter logic here
                        console.log('Organization filter:', e.target.value);
                      }}
                    >
                      <option value="">All Organizations</option>
                      <option value="university">University</option>
                      <option value="company">Company</option>
                      <option value="nonprofit">Non-profit</option>
                      <option value="government">Government</option>
                      <option value="other">Other</option>
                    </select>
                    
                    <select
                      className="px-3 py-1 border border-input bg-background text-foreground rounded-md focus:ring-1 focus:ring-ring focus:border-ring text-sm"
                      onChange={(e) => {
                        // Add email status filter logic here
                        console.log('Email status filter:', e.target.value);
                      }}
                    >
                      <option value="">Email Status</option>
                      <option value="sent">Email Sent</option>
                      <option value="not-sent">Email Not Sent</option>
                    </select>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-muted-foreground">From:</label>
                      <input
                        type="date"
                        className="px-3 py-1 border border-input bg-background text-foreground rounded-md focus:ring-1 focus:ring-ring focus:border-ring text-sm"
                        onChange={(e) => {
                          // Add date filter logic here
                          console.log('Date from filter:', e.target.value);
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-muted-foreground">To:</label>
                      <input
                        type="date"
                        className="px-3 py-1 border border-input bg-background text-foreground rounded-md focus:ring-1 focus:ring-ring focus:border-ring text-sm"
                        onChange={(e) => {
                          // Add date filter logic here
                          console.log('Date to filter:', e.target.value);
                        }}
                      />
                    </div>
                    
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setPaidFilter('all');
                        setSortBy('submissionDate');
                        setSortOrder('desc');
                        // Reset other filters
                      }}
                      className="px-3 py-1 text-sm text-primary hover:text-primary/80 underline transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedMembers.length > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary">
                    {selectedMembers.length} member(s) selected
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkAction('paid')}
                      disabled={actionLoading === 'bulk'}
                      className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded hover:bg-accent/80 disabled:opacity-50 transition-colors"
                    >
                      Mark Paid
                    </button>
                    <button
                      onClick={() => handleBulkAction('unpaid')}
                      disabled={actionLoading === 'bulk'}
                      className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded hover:bg-secondary/80 disabled:opacity-50 transition-colors"
                    >
                      Mark Unpaid
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      disabled={actionLoading === 'bulk'}
                      className="px-3 py-1 bg-destructive text-destructive-foreground text-sm rounded hover:bg-destructive/80 disabled:opacity-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Members Table - Desktop */}
            <div className="bg-card shadow rounded-lg overflow-hidden border border-border hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedMembers.length === members.length && members.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-input text-primary focus:ring-ring"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {members.map((member) => (
                      <tr key={member._id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member._id)}
                            onChange={() => toggleMemberSelection(member._id)}
                            className="rounded border-input text-primary focus:ring-ring"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-foreground">{member.fullName}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {member.organization || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setShowConfirmDialog({
                              show: true,
                              memberId: member._id,
                              action: member.paid ? 'unpaid' : 'paid'
                            })}
                            disabled={actionLoading === member._id}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              member.paid
                                ? 'bg-accent/20 text-accent hover:bg-accent/30'
                                : 'bg-destructive/20 text-destructive hover:bg-destructive/30'
                            } transition-colors disabled:opacity-50`}
                          >
                            {actionLoading === member._id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                            ) : member.paid ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : (
                              <X className="h-3 w-3 mr-1" />
                            )}
                            {member.paid ? 'Paid' : 'Unpaid'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            member.emailSent
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <Mail className="h-3 w-3 mr-1" />
                            {member.emailSent ? 'Sent' : 'Not Sent'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(member.submissionDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setShowConfirmDialog({
                              show: true,
                              memberId: member._id,
                              action: 'delete'
                            })}
                            disabled={actionLoading === member._id}
                            className="text-destructive hover:text-destructive/80 disabled:opacity-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Members Cards - Mobile */}
            <div className="md:hidden space-y-4">
              {/* Select All - Mobile */}
              <div className="bg-card p-4 rounded-lg border border-border">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedMembers.length === members.length && members.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-input text-primary focus:ring-ring"
                  />
                  <span className="text-sm font-medium text-foreground">Select All Members</span>
                </label>
              </div>
              
              {members.map((member) => (
                <div key={member._id} className="bg-card p-4 rounded-lg border border-border space-y-3">
                  {/* Header with checkbox and name */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member._id)}
                        onChange={() => toggleMemberSelection(member._id)}
                        className="rounded border-input text-primary focus:ring-ring mt-1"
                      />
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{member.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowConfirmDialog({
                        show: true,
                        memberId: member._id,
                        action: 'delete'
                      })}
                      disabled={actionLoading === member._id}
                      className="text-destructive hover:text-destructive/80 disabled:opacity-50 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Organization:</span>
                      <p className="text-foreground font-medium">{member.organization || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Joined:</span>
                      <p className="text-foreground font-medium">{formatDate(member.submissionDate)}</p>
                    </div>
                  </div>
                  
                  {/* Status badges */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowConfirmDialog({
                        show: true,
                        memberId: member._id,
                        action: member.paid ? 'unpaid' : 'paid'
                      })}
                      disabled={actionLoading === member._id}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        member.paid
                          ? 'bg-accent/20 text-accent hover:bg-accent/30'
                          : 'bg-destructive/20 text-destructive hover:bg-destructive/30'
                      } transition-colors disabled:opacity-50`}
                    >
                      {actionLoading === member._id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                      ) : member.paid ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <X className="h-3 w-3 mr-1" />
                      )}
                      {member.paid ? 'Paid' : 'Unpaid'}
                    </button>
                    
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.emailSent
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Mail className="h-3 w-3 mr-1" />
                      {member.emailSent ? 'Email Sent' : 'Email Not Sent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="bg-card px-4 py-3 flex items-center justify-between border-t border-border sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Showing{' '}
                        <span className="font-medium text-foreground">
                          {(currentPage - 1) * pagination.limit + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium text-foreground">
                          {Math.min(currentPage * pagination.limit, pagination.totalCount)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium text-foreground">{pagination.totalCount}</span>{' '}
                        results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={!pagination.hasPrevPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-border bg-card text-sm font-medium text-foreground">
                          {currentPage} of {pagination.totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg shadow border border-border">
                <h3 className="text-lg font-medium text-foreground mb-4">Monthly Registration vs Payment</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="registered" fill="hsl(var(--primary))" name="Registered" />
                    <Bar dataKey="paid" fill="hsl(var(--accent))" name="Paid" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card p-6 rounded-lg shadow border border-border">
                <h3 className="text-lg font-medium text-foreground mb-4">Payment Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.paymentStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {analytics.paymentStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg shadow border border-border">
                <h3 className="text-lg font-medium text-foreground mb-4">Registration Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.registrationTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card p-6 rounded-lg shadow border border-border">
                <h3 className="text-lg font-medium text-foreground mb-4">Top Organizations</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.organizationStats} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" className="text-muted-foreground" />
                    <YAxis dataKey="name" type="category" width={100} className="text-muted-foreground" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-border w-96 shadow-lg rounded-md bg-card">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/20">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-medium text-foreground mt-4">
                Confirm Action
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-muted-foreground">
                  {showConfirmDialog.action === 'delete'
                    ? 'Are you sure you want to delete this member? This action cannot be undone.'
                    : `Are you sure you want to mark this member as ${showConfirmDialog.action}?`
                  }
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowConfirmDialog(null)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground text-base font-medium rounded-md shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showConfirmDialog.action === 'delete') {
                      handleDeleteMember(showConfirmDialog.memberId);
                    } else {
                      const member = members.find(m => m._id === showConfirmDialog.memberId);
                      if (member) {
                        handlePaymentToggle(showConfirmDialog.memberId, member.paid);
                      }
                    }
                  }}
                  className={`px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    showConfirmDialog.action === 'delete'
                      ? 'bg-destructive hover:bg-destructive/90'
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {showConfirmDialog.action === 'delete' ? 'Delete' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}