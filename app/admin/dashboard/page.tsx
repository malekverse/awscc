'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  CreditCard,
  Mail,
  BarChart3,
  LogOut,
  AlertTriangle,
  Shield,
  Bell,
  RefreshCw,
  Download,
  TrendingUp,
  X
} from 'lucide-react';
import StatsSection from '../../../components/StatsSection';
import MembersTable from '../../../components/MembersTable';
import AnalyticsCharts from '../../../components/AnalyticsCharts';
import EmailModal from '../../../components/EmailModal';
import { Member, PaginationInfo, AdminInfo, AnalyticsData, DashboardStats } from '../../../types/dashboard';

// Types are now imported from ../../../types/dashboard

// Components
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }: {
  title: string;
  value: string | number;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}) => {
  const colorClasses = {
    primary: 'bg-blue-50 text-blue-600 border-blue-200',
    success: 'bg-green-50 text-green-600 border-green-200',
    warning: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    danger: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${
                trend === 'down' ? 'rotate-180' : ''
              }`} />
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

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

export default function AdminDashboard() {
  // State
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paidFilter, setPaidFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('submissionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    memberId: string;
    action: string;
    memberName?: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'analytics'>('overview');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [recipientType, setRecipientType] = useState<'single' | 'multiple' | 'all'>('all');
  const [isEmailSending, setIsEmailSending] = useState(false);
  
  const router = useRouter();

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // API functions
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/check', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        router.push('/admin/login');
        return false;
      }
      
      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
        return true;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
      return false;
    }
    return false;
  };

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

      const response = await fetch(`/api/admin/members?${params}`, {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMembers(data.data.members || []);
          setFilteredMembers(data.data.members || []);
          setPagination(data.data.pagination);
        }
      } else {
        // Fallback to mock data for development
        const mockMembers: Member[] = [
          {
            _id: '1',
            fullName: 'John Doe',
            email: 'john@example.com',
            organization: 'Tech Corp',
            paid: true,
            emailSent: true,
            submissionDate: new Date().toISOString(),
            paidDate: new Date().toISOString()
          },
          {
            _id: '2',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            organization: 'Design Studio',
            paid: false,
            emailSent: false,
            submissionDate: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setMembers(mockMembers);
        setFilteredMembers(mockMembers);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: mockMembers.length,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
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
      } else {
        // Mock analytics data
        setAnalytics({
          registrationTrend: [
            { date: '2024-01', count: 45 },
            { date: '2024-02', count: 52 },
            { date: '2024-03', count: 38 },
            { date: '2024-04', count: 61 },
            { date: '2024-05', count: 55 }
          ],
          paymentStatus: [
            { name: 'Paid', value: 65, color: '#10B981' },
            { name: 'Unpaid', value: 35, color: '#EF4444' }
          ],
          organizationStats: [
            { name: 'Tech Corp', count: 25 },
            { name: 'Design Studio', count: 18 },
            { name: 'StartupXYZ', count: 15 },
            { name: 'University', count: 12 }
          ],
          monthlyStats: [
            { month: 'Jan', registered: 45, paid: 30 },
            { month: 'Feb', registered: 52, paid: 35 },
            { month: 'Mar', registered: 38, paid: 25 },
            { month: 'Apr', registered: 61, paid: 40 },
            { month: 'May', registered: 55, paid: 38 }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const calculateStats = () => {
    const totalMembers = members.length;
    const paidMembers = members.filter(m => m.paid).length;
    const unpaidMembers = totalMembers - paidMembers;
    const recentRegistrations = members.filter(m => {
      const submissionDate = new Date(m.submissionDate);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return submissionDate > weekAgo;
    }).length;
    
    const totalRevenue = paidMembers * 10; // 10 DT per member registration fee
    const conversionRate = totalMembers > 0 ? (paidMembers / totalMembers) * 100 : 0;

    setStats({
      totalMembers,
      paidMembers,
      unpaidMembers,
      recentRegistrations,
      totalRevenue,
      conversionRate
    });
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMembers(),
      fetchAnalytics()
    ]);
    setRefreshing(false);
  };

  // Action handlers
  const handlePaymentToggle = async (memberId: string, currentStatus: boolean) => {
    setActionLoading(memberId);
    try {
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ paid: !currentStatus }),
      });

      if (response.ok) {
        await fetchMembers();
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

  const handleDeleteMember = async (memberId: string) => {
    setActionLoading(memberId);
    try {
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchMembers();
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

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin/login');
    }
  };

  // Email templates
  const emailTemplates = {
    welcome: {
      subject: 'Welcome to AWS Cloud Club ISIMS!',
      content: `Dear {{name}},

Welcome to the AWS Cloud Club ISIMS! We're excited to have you join our community of cloud enthusiasts.

Your membership registration has been successfully processed. Here's what you can expect as a member:

• Access to exclusive workshops and training sessions
• Networking opportunities with industry professionals
• Hands-on experience with AWS technologies
• Collaboration on real-world cloud projects
• Preparation resources for AWS certifications

We'll be in touch soon with details about upcoming events and how you can get involved.

Best regards,
AWS Cloud Club ISIMS Team`
    },
    reminder: {
      subject: 'Payment Reminder - AWS Cloud Club ISIMS',
      content: `Dear {{name}},

This is a friendly reminder that your membership payment for AWS Cloud Club ISIMS is still pending.

To complete your membership and gain access to all our exclusive benefits, please process your payment at your earliest convenience.

If you have any questions or need assistance with the payment process, please don't hesitate to contact us.

Best regards,
AWS Cloud Club ISIMS Team`
    },
    announcement: {
      subject: 'Important Announcement - AWS Cloud Club ISIMS',
      content: `Dear {{name}},

We have an important announcement to share with our AWS Cloud Club ISIMS community.

[Your announcement content here]

Stay tuned for more updates and exciting opportunities!

Best regards,
AWS Cloud Club ISIMS Team`
    },
    event: {
      subject: 'Upcoming Event - AWS Cloud Club ISIMS',
      content: `Dear {{name}},

We're excited to invite you to our upcoming event!

Event Details:
• Date: [Event Date]
• Time: [Event Time]
• Location: [Event Location]
• Topic: [Event Topic]

This is a great opportunity to learn, network, and enhance your AWS skills. We look forward to seeing you there!

Best regards,
AWS Cloud Club ISIMS Team`
    }
  };

  // Email sending function
  const handleSendEmails = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      alert('Please fill in both subject and content fields.');
      return;
    }

    if (recipientType !== 'all' && selectedRecipients.length === 0) {
      alert('Please select at least one recipient.');
      return;
    }

    setIsEmailSending(true);
    try {
      const recipients = recipientType === 'all' 
        ? filteredMembers.map(m => ({ email: m.email, name: m.fullName }))
        : filteredMembers
            .filter(m => selectedRecipients.includes(m._id))
            .map(m => ({ email: m.email, name: m.fullName }));

      const response = await fetch('/api/admin/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          subject: emailSubject,
          content: emailContent,
          recipients
        })
      });

      if (response.ok) {
        alert('Emails sent successfully!');
        setShowEmailModal(false);
        setEmailSubject('');
        setEmailContent('');
        setSelectedRecipients([]);
        setRecipientType('all');
      } else {
        const error = await response.text();
        alert(`Failed to send emails: ${error}`);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails. Please try again.');
    } finally {
      setIsEmailSending(false);
    }
  };

  // Template selection handler
  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = emailTemplates[templateKey as keyof typeof emailTemplates];
    if (template) {
      setEmailSubject(template.subject);
      setEmailContent(template.content);
    }
  };

  // Initialize email modal with default template
  useEffect(() => {
    if (showEmailModal && !emailSubject && !emailContent) {
      const template = emailTemplates[selectedTemplate as keyof typeof emailTemplates];
      if (template) {
        setEmailSubject(template.subject);
        setEmailContent(template.content);
      }
    }
  }, [showEmailModal, selectedTemplate, emailSubject, emailContent, emailTemplates]);

  // Selection handlers
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleRecipientSelection = (memberId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedMembers(prev => 
      prev.length === filteredMembers.length ? [] : filteredMembers.map(m => m._id)
    );
  };

  // Effects
  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await Promise.all([
          fetchMembers(),
          fetchAnalytics()
        ]);
      }
      setLoading(false);
    };

    initDashboard();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchMembers();
    }
  }, [currentPage, searchTerm, paidFilter, sortBy, sortOrder]);

  useEffect(() => {
    calculateStats();
  }, [members]);

  // Filter members based on search and filters
  useEffect(() => {
    let filtered = [...members];
    
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.organization && member.organization.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredMembers(filtered);
  }, [members, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {admin?.fullName || 'Administrator'}</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full">
                  <Bell className="h-5 w-5" />
                </button>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </div>

              <button
                onClick={() => exportData('csv')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
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
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
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
          <StatsSection
            stats={stats}
            filteredMembers={filteredMembers}
            onExportData={exportData}
            onShowEmailModal={() => setShowEmailModal(true)}
            onViewAllMembers={() => setActiveTab('members')}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <MembersTable
            filteredMembers={filteredMembers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            paidFilter={paidFilter}
            setPaidFilter={setPaidFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            selectedMembers={selectedMembers}
            toggleMemberSelection={toggleMemberSelection}
            toggleSelectAll={toggleSelectAll}
            handleBulkAction={handleBulkAction}
            actionLoading={actionLoading}
            setShowConfirmDialog={setShowConfirmDialog}
            pagination={pagination}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            formatDate={formatDate}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsCharts analytics={analytics} />
        )}
      </main>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Send Emails</h2>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="welcome">Welcome Email</option>
                  <option value="reminder">Payment Reminder</option>
                  <option value="announcement">Announcement</option>
                  <option value="event">Event Invitation</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter email content. Use {{name}} to personalize with member names."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tip: Use {{name}} in your content to automatically insert each member's name.
                </p>
              </div>

              {/* Recipient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        value="all"
                        checked={recipientType === 'all'}
                        onChange={(e) => setRecipientType(e.target.value as 'all')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">All Members ({filteredMembers.length})</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        value="multiple"
                        checked={recipientType === 'multiple'}
                        onChange={(e) => setRecipientType(e.target.value as 'multiple')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Select Multiple</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        value="single"
                        checked={recipientType === 'single'}
                        onChange={(e) => setRecipientType(e.target.value as 'single')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Single Member</span>
                    </label>
                  </div>

                  {/* Member Selection List */}
                  {recipientType !== 'all' && (
                    <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">
                          Select Recipients ({selectedRecipients.length} selected)
                        </span>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {filteredMembers.map((member) => (
                          <label key={member._id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                            <input
                              type={recipientType === 'single' ? 'radio' : 'checkbox'}
                              name={recipientType === 'single' ? 'singleRecipient' : undefined}
                              checked={selectedRecipients.includes(member._id)}
                              onChange={() => {
                                if (recipientType === 'single') {
                                  setSelectedRecipients([member._id]);
                                } else {
                                  toggleRecipientSelection(member._id);
                                }
                              }}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white font-medium text-xs">
                                    {member.fullName.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                                  <p className="text-sm text-gray-500">{member.email}</p>
                                </div>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.paid
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.paid ? 'Paid' : 'Unpaid'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmails}
                disabled={isEmailSending || !emailSubject.trim() || !emailContent.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEmailSending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  `Send Email${recipientType === 'all' ? `s (${filteredMembers.length})` : selectedRecipients.length > 1 ? `s (${selectedRecipients.length})` : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Confirm Action
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                {showConfirmDialog.action === 'delete'
                  ? `Are you sure you want to delete ${showConfirmDialog.memberName}? This action cannot be undone.`
                  : `Are you sure you want to mark ${showConfirmDialog.memberName} as ${showConfirmDialog.action}?`
                }
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmDialog(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                  disabled={actionLoading === showConfirmDialog.memberId}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                    showConfirmDialog.action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {actionLoading === showConfirmDialog.memberId ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    showConfirmDialog.action === 'delete' ? 'Delete' : 'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}