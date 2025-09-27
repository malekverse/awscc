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
  X,
  FileText,
  Award,
  Calendar,
  UserCheck
} from 'lucide-react';
import StatsSection from '../../../components/StatsSection';
import MembersTable from '../../../components/MembersTable';
import ResourcesTable from '../../../components/ResourcesTable';
import CertificationsTable from '../../../components/CertificationsTable';
import EventsTable from '../../../components/EventsTable';
import MemberCertificationsTable from '../../../components/MemberCertificationsTable';
import AnalyticsCharts from '../../../components/AnalyticsCharts';
import EmailModal from '../../../components/EmailModal';
import ResourceModal from '../../../components/ResourceModal';
import CertificationModal from '../../../components/CertificationModal';
import EventModal from '../../../components/EventModal';
import { Member, PaginationInfo, AdminInfo, AnalyticsData, DashboardStats } from '../../../types/dashboard';

// Component definitions
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

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {trend && trendValue && (
            <p className={`text-sm mt-2 ${trendColors[trend]}`}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white bg-opacity-50">
          <Icon className="h-8 w-8" />
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
  const router = useRouter();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    paidMembers: 0,
    unpaidMembers: 0,
    recentRegistrations: 0,
    totalRevenue: 0,
    conversionRate: 0
  });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'resources' | 'certifications' | 'events' | 'member-certifications' | 'analytics'>('overview');
  
  // New feature states
  const [resources, setResources] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [events, setEvents] = useState([]);
  const [memberCertifications, setMemberCertifications] = useState([]);
  
  // Filter states for new features
  const [resourceSearchTerm, setResourceSearchTerm] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState('all');
  const [resourceSortBy, setResourceSortBy] = useState('createdAt');
  
  const [resourceSortOrder, setResourceSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [certificationSearchTerm, setCertificationSearchTerm] = useState('');
  const [certificationLevelFilter, setCertificationLevelFilter] = useState('all');
  const [certificationCategoryFilter, setCertificationCategoryFilter] = useState('all');
  const [certificationStatusFilter, setCertificationStatusFilter] = useState('all');
  const [certificationSortBy, setCertificationSortBy] = useState('name');
  const [certificationSortOrder, setCertificationSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [eventLocationFilter, setEventLocationFilter] = useState('all');
  const [eventSortBy, setEventSortBy] = useState('date');
  const [eventSortOrder, setEventSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [memberCertSearchTerm, setMemberCertSearchTerm] = useState('');
  const [memberCertStatusFilter, setMemberCertStatusFilter] = useState('all');
  const [memberCertCertificationFilter, setMemberCertCertificationFilter] = useState('all');
  const [memberCertMemberFilter, setMemberCertMemberFilter] = useState('all');
  const [memberCertSortBy, setMemberCertSortBy] = useState('issueDate');
  const [memberCertSortOrder, setMemberCertSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Existing states
  const [searchTerm, setSearchTerm] = useState('');
  const [paidFilter, setPaidFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [sortBy, setSortBy] = useState<'fullName' | 'email' | 'submissionDate' | 'paidDate'>('submissionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    memberId: string;
    memberName: string;
    action: 'paid' | 'unpaid' | 'delete';
  } | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  // Email modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [recipientType, setRecipientType] = useState<'all' | 'multiple' | 'single'>('all');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isEmailSending, setIsEmailSending] = useState(false);
  
  // Resource modal states
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  
  // Certification modal states
  const [isCertificationModalOpen, setIsCertificationModalOpen] = useState(false);
  const [isCreatingCertification, setIsCreatingCertification] = useState(false);
  
  // Event modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

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
    return `${amount.toFixed(2)} DT`;
  };

  // API functions
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/check', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
        return true;
      } else {
        router.push('/admin/login');
        return false;
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

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/admin/resources', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setResources(data.data || []);
      } else {
        // Mock resources data
        setResources([]);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    }
  };

  const fetchCertifications = async () => {
    try {
      const response = await fetch('/api/admin/certifications', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCertifications(data.data || []);
      } else {
        // Mock certifications data
        setCertifications([]);
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
      setCertifications([]);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      } else {
        // Mock events data
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  const fetchMemberCertifications = async () => {
    try {
      const response = await fetch('/api/admin/member-certifications', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMemberCertifications(data.data || []);
      } else {
        // Mock member certifications data
        setMemberCertifications([]);
      }
    } catch (error) {
      console.error('Error fetching member certifications:', error);
      setMemberCertifications([]);
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
      fetchAnalytics(),
      fetchResources(),
      fetchCertifications(),
      fetchEvents(),
      fetchMemberCertifications()
    ]);
    setRefreshing(false);
  };

  // Handle bulk actions for members
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
      } else {
        const errorData = await response.json();
        console.error('Bulk action failed:', errorData.error);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle member selection
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Toggle select all members
  const toggleSelectAll = () => {
    setSelectedMembers(prev => 
      prev.length === filteredMembers.length ? [] : filteredMembers.map(m => m._id)
    );
  };

  // Handle individual member payment toggle
  const handlePaymentToggle = async (memberId: string, currentPaidStatus: boolean) => {
    try {
      setActionLoading(memberId);
      const response = await fetch('/api/admin/members/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          memberIds: [memberId],
          action: currentPaidStatus ? 'unpaid' : 'paid'
        })
      });

      if (response.ok) {
        await fetchMembers();
        setShowConfirmDialog(null);
      } else {
        const errorData = await response.json();
        console.error('Payment toggle failed:', errorData.error);
      }
    } catch (error) {
      console.error('Error toggling payment status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle individual member deletion
  const handleDeleteMember = async (memberId: string) => {
    try {
      setActionLoading(memberId);
      const response = await fetch('/api/admin/members/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          memberIds: [memberId],
          action: 'delete'
        })
      });

      if (response.ok) {
        await fetchMembers();
        setShowConfirmDialog(null);
      } else {
        const errorData = await response.json();
        console.error('Member deletion failed:', errorData.error);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    } finally {
      setActionLoading(null);
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

  // Effects
  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await Promise.all([
          fetchMembers(),
          fetchAnalytics(),
          fetchResources(),
          fetchCertifications(),
          fetchEvents(),
          fetchMemberCertifications()
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
    <div className="min-h-screen bg-gray-50 text-black">
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
                { id: 'resources', name: 'Resources', icon: FileText },
                { id: 'certifications', name: 'Certifications', icon: Award },
                { id: 'events', name: 'Events', icon: Calendar },
                { id: 'member-certifications', name: 'Member Certs', icon: UserCheck },
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
            onExportData={() => console.log('Export data')}
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

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <ResourcesTable
            resources={resources}
            searchTerm={resourceSearchTerm}
            setSearchTerm={setResourceSearchTerm}
            typeFilter={resourceTypeFilter}
            setTypeFilter={setResourceTypeFilter}
            categoryFilter={resourceCategoryFilter}
            setCategoryFilter={setResourceCategoryFilter}
            sortBy={resourceSortBy}
            setSortBy={setResourceSortBy}
            sortOrder={resourceSortOrder}
            setSortOrder={setResourceSortOrder}
            onCreateResource={() => setIsResourceModalOpen(true)}
            onEditResource={(resource) => console.log('Edit resource', resource)}
            onDeleteResource={(resourceId) => console.log('Delete resource', resourceId)}
            onDownloadResource={(resourceId) => console.log('Download resource', resourceId)}
            formatDate={formatDate}
          />
        )}

        {/* Resource Modal */}
        <ResourceModal
          isOpen={isResourceModalOpen}
          onClose={() => setIsResourceModalOpen(false)}
          onSubmit={async (resourceData: FormData) => {
            setIsCreatingResource(true);
            try {
              const response = await fetch('/api/admin/resources', {
                method: 'POST',
                body: resourceData,
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create resource');
              }

              const newResource = await response.json();
              
              // Refresh resources data
              await fetchResources();
              
              // Close modal
              setIsResourceModalOpen(false);
              
              // Show success message (you can implement a toast notification here)
              alert('Resource created successfully!');
            } catch (error) {
              console.error('Error creating resource:', error);
              alert(error instanceof Error ? error.message : 'Failed to create resource');
            } finally {
              setIsCreatingResource(false);
            }
          }}
          loading={isCreatingResource}
        />

        {/* Certification Modal */}
        <CertificationModal
          isOpen={isCertificationModalOpen}
          onClose={() => setIsCertificationModalOpen(false)}
          onSubmit={async (certificationData: any) => {
            setIsCreatingCertification(true);
            try {
              const response = await fetch('/api/admin/certifications', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(certificationData),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create certification');
              }

              const newCertification = await response.json();
              
              // Refresh certifications data
              await fetchCertifications();
              
              // Close modal
              setIsCertificationModalOpen(false);
              
              // Show success message (you can implement a toast notification here)
              alert('Certification created successfully!');
            } catch (error) {
              console.error('Error creating certification:', error);
              alert(error instanceof Error ? error.message : 'Failed to create certification');
            } finally {
              setIsCreatingCertification(false);
            }
          }}
          loading={isCreatingCertification}
        />

        {/* Event Modal */}
        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSubmit={async (eventData: FormData) => {
            setIsCreatingEvent(true);
            try {
              const response = await fetch('/api/admin/events', {
                method: 'POST',
                body: eventData,
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create event');
              }

              const newEvent = await response.json();
              
              // Refresh events data
              await fetchEvents();
              
              // Close modal
              setIsEventModalOpen(false);
              
              // Show success message (you can implement a toast notification here)
              alert('Event created successfully!');
            } catch (error) {
              console.error('Error creating event:', error);
              alert(error instanceof Error ? error.message : 'Failed to create event');
            } finally {
              setIsCreatingEvent(false);
            }
          }}
          loading={isCreatingEvent}
        />

        {/* Certifications Tab */}
        {activeTab === 'certifications' && (
          <CertificationsTable
            certifications={certifications}
            searchTerm={certificationSearchTerm}
            setSearchTerm={setCertificationSearchTerm}
            levelFilter={certificationLevelFilter}
            setLevelFilter={setCertificationLevelFilter}
            categoryFilter={certificationCategoryFilter}
            setCategoryFilter={setCertificationCategoryFilter}
            statusFilter={certificationStatusFilter}
            setStatusFilter={setCertificationStatusFilter}
            sortBy={certificationSortBy}
            setSortBy={setCertificationSortBy}
            sortOrder={certificationSortOrder}
            setSortOrder={setCertificationSortOrder}
            onCreateCertification={() => setIsCertificationModalOpen(true)}
            onEditCertification={(certification) => console.log('Edit certification', certification)}
            onDeleteCertification={(certificationId) => console.log('Delete certification', certificationId)}
            onViewMembers={(certificationId) => console.log('View members', certificationId)}
            formatDate={formatDate}
          />
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <EventsTable
            events={events}
            searchTerm={eventSearchTerm}
            setSearchTerm={setEventSearchTerm}
            typeFilter={eventTypeFilter}
            setTypeFilter={setEventTypeFilter}
            statusFilter={eventStatusFilter}
            setStatusFilter={setEventStatusFilter}
            locationFilter={eventLocationFilter}
            setLocationFilter={setEventLocationFilter}
            sortBy={eventSortBy}
            setSortBy={setEventSortBy}
            sortOrder={eventSortOrder}
            setSortOrder={setEventSortOrder}
            onCreateEvent={() => setIsEventModalOpen(true)}
            onEditEvent={(event) => console.log('Edit event', event)}
            onDeleteEvent={(eventId) => console.log('Delete event', eventId)}
            onViewRegistrations={(eventId) => console.log('View registrations', eventId)}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Member Certifications Tab */}
        {activeTab === 'member-certifications' && (
          <MemberCertificationsTable
            memberCertifications={memberCertifications}
            searchTerm={memberCertSearchTerm}
            setSearchTerm={setMemberCertSearchTerm}
            statusFilter={memberCertStatusFilter}
            setStatusFilter={setMemberCertStatusFilter}
            certificationFilter={memberCertCertificationFilter}
            setCertificationFilter={setMemberCertCertificationFilter}
            memberFilter={memberCertMemberFilter}
            setMemberFilter={setMemberCertMemberFilter}
            sortBy={memberCertSortBy}
            setSortBy={setMemberCertSortBy}
            sortOrder={memberCertSortOrder}
            setSortOrder={setMemberCertSortOrder}
            onIssueCertification={() => console.log('Issue certification')}
            onRenewCertification={(certificationId) => console.log('Renew certification', certificationId)}
            onRevokeCertification={(certificationId) => console.log('Revoke certification', certificationId)}
            onDownloadCertificate={(certificationId) => console.log('Download certificate', certificationId)}
            onViewMember={(memberId) => console.log('View member', memberId)}
            formatDate={formatDate}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsCharts analytics={analytics} />
        )}
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                {showConfirmDialog.action === 'delete'
                  ? 'Delete Member'
                  : `Mark as ${showConfirmDialog.action === 'paid' ? 'Paid' : 'Unpaid'}`
                }
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {showConfirmDialog.action === 'delete'
                    ? `Are you sure you want to delete ${showConfirmDialog.memberName}? This action cannot be undone.`
                    : `Are you sure you want to mark ${showConfirmDialog.memberName} as ${showConfirmDialog.action}?`
                  }
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowConfirmDialog(null)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showConfirmDialog.action === 'delete') {
                      handleDeleteMember(showConfirmDialog.memberId);
                    } else {
                      const member = filteredMembers.find(m => m._id === showConfirmDialog.memberId);
                      if (member) {
                        handlePaymentToggle(showConfirmDialog.memberId, member.paid);
                      }
                    }
                  }}
                  disabled={actionLoading === showConfirmDialog.memberId}
                  className={`px-4 py-2 text-white text-base font-medium rounded-md w-24 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                    showConfirmDialog.action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'
                  }`}
                >
                  {actionLoading === showConfirmDialog.memberId ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white mx-auto"></div>
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