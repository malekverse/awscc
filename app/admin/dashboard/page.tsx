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
  UserCheck,
  Video,
  Moon,
  Sun
} from 'lucide-react';
import StatsSection from '../../../components/StatsSection';
import MembersTable from '../../../components/MembersTable';
import ResourcesTable from '../../../components/ResourcesTable';
import CertificationsTable from '../../../components/CertificationsTable';
import EventsTable from '../../../components/EventsTable';
import MemberCertificationsTable from '../../../components/MemberCertificationsTable';
import AnalyticsCharts from '../../../components/AnalyticsCharts';
import VideoCoursesTable from '../../../components/VideoCoursesTable';
import VideoCoursesModal from '../../../components/VideoCoursesModal';
import EmailModal from '../../../components/EmailModal';
import EmailReminderModal from '../../../components/EmailReminderModal';
import ResourceModal from '../../../components/ResourceModal';
import CertificationModal from '../../../components/CertificationModal';
import EventModal from '../../../components/EventModal';
import { ToastContainer } from '../../../components/Toast';
import { useTheme } from '../../../contexts/theme-context';
import { Member, PaginationInfo, AdminInfo, AnalyticsData, DashboardStats } from '../../../types/dashboard';

// Types
interface IVideoCourse {
  _id: string;
  title: string;
  description: string;
  videoType: 'youtube' | 'vimeo' | 'direct_upload' | 'embed';
  videoUrl?: string;
  embedCode?: string;
  thumbnailUrl?: string;
  duration?: number;
  quality?: string;
  fileSize?: number;
  instructor: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  learningObjectives: string[];
  isPublic: boolean;
  isActive: boolean;
  isFeatured: boolean;
  createdBy: string;
  lastModifiedBy?: string;
  viewCount: number;
  completionCount: number;
  averageRating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

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
    primary: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30',
    success: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    danger: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  };

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground'
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg dark:hover:shadow-xl`}>
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
        <div className="p-3 rounded-lg bg-background/50 border border-border/50">
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const EmptyState = ({ title, description, icon: Icon }: {
  title: string;
  description: string;
  icon: any;
}) => (
  <div className="text-center py-12">
    <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
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
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'resources' | 'certifications' | 'events' | 'member-certifications' | 'analytics' | 'email-reminders'>('overview');
  
  // New feature states
  const [resources, setResources] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [events, setEvents] = useState([]);
  const [memberCertifications, setMemberCertifications] = useState([]);
  const [videoCourses, setVideoCourses] = useState<IVideoCourse[]>([]);
  
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
  
  // Video courses filter states
  const [videoCoursesSearchTerm, setVideoCoursesSearchTerm] = useState('');
  const [videoCoursesCategoryFilter, setVideoCoursesCategoryFilter] = useState('all');
  const [videoCoursesDifficultyFilter, setVideoCoursesDifficultyFilter] = useState('all');
  const [videoCoursesVideoTypeFilter, setVideoCoursesVideoTypeFilter] = useState('all');
  const [videoCoursesStatusFilter, setVideoCoursesStatusFilter] = useState('all');
  const [videoCoursesSortBy, setVideoCoursesSortBy] = useState('createdAt');
  const [videoCoursesSortOrder, setVideoCoursesSortOrder] = useState<'asc' | 'desc'>('desc');
  
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
  
  // Video courses modal states
  const [isVideoCoursesModalOpen, setIsVideoCoursesModalOpen] = useState(false);
  const [isCreatingVideoCourse, setIsCreatingVideoCourse] = useState(false);
  const [editingVideoCourse, setEditingVideoCourse] = useState<any>(null);

  // Email reminder modal states
  const [isEmailReminderModalOpen, setIsEmailReminderModalOpen] = useState(false);
  const [isEmailReminderSending, setIsEmailReminderSending] = useState(false);
  const [memberCount, setMemberCount] = useState<number>(0);

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

  const fetchVideoCourses = async () => {
    try {
      const params = new URLSearchParams({
        search: videoCoursesSearchTerm,
        category: videoCoursesCategoryFilter !== 'all' ? videoCoursesCategoryFilter : '',
        difficulty: videoCoursesDifficultyFilter !== 'all' ? videoCoursesDifficultyFilter : '',
        status: videoCoursesStatusFilter !== 'all' ? videoCoursesStatusFilter : '',
        sortBy: videoCoursesSortBy,
        sortOrder: videoCoursesSortOrder
      });

      const response = await fetch(`/api/admin/video-courses?${params}`, {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVideoCourses(data.data || []);
        }
      } else {
        // Fallback to empty array for development
        setVideoCourses([]);
      }
    } catch (error) {
      console.error('Failed to fetch video courses:', error);
      setVideoCourses([]);
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
      fetchMemberCertifications(),
      fetchVideoCourses()
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
          fetchMemberCertifications(),
          fetchVideoCourses()
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Modern Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {admin?.fullName || 'Administrator'}</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center p-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
              
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="relative">
                <button className="p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-card"></span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
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
                { id: 'resources', name: 'Resources', icon: FileText },
                { id: 'video-courses', name: 'Video Courses', icon: Video },
                { id: 'certifications', name: 'Certifications', icon: Award },
                { id: 'events', name: 'Events', icon: Calendar },
                { id: 'member-certifications', name: 'Member Certs', icon: UserCheck },
                { id: 'email-reminders', name: 'Email Reminders', icon: Mail },
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
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
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

        {/* Video Courses Tab */}
        {activeTab === 'video-courses' && (
          <VideoCoursesTable
            videoCourses={videoCourses}
            searchTerm={videoCoursesSearchTerm}
            setSearchTerm={setVideoCoursesSearchTerm}
            categoryFilter={videoCoursesCategoryFilter}
            setCategoryFilter={setVideoCoursesCategoryFilter}
            difficultyFilter={videoCoursesDifficultyFilter}
            setDifficultyFilter={setVideoCoursesDifficultyFilter}
            videoTypeFilter={videoCoursesVideoTypeFilter}
            setVideoTypeFilter={setVideoCoursesVideoTypeFilter}
            statusFilter={videoCoursesStatusFilter}
            setStatusFilter={setVideoCoursesStatusFilter}
            sortBy={videoCoursesSortBy}
            setSortBy={setVideoCoursesSortBy}
            sortOrder={videoCoursesSortOrder}
            setSortOrder={setVideoCoursesSortOrder}
            onCreateCourse={() => {
              setEditingVideoCourse(null);
              setIsVideoCoursesModalOpen(true);
            }}
            onEditCourse={(videoCourse) => {
              setEditingVideoCourse(videoCourse);
              setIsVideoCoursesModalOpen(true);
            }}
            onDeleteCourse={async (videoCourseId) => {
              if (window.confirm('Are you sure you want to delete this video course? This action cannot be undone.')) {
                try {
                  const response = await fetch(`/api/admin/video-courses/${videoCourseId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                  });

                  if (response.ok) {
                    // Refresh the video courses list
                    fetchVideoCourses();
                    alert('Video course deleted successfully!');
                  } else {
                    const errorData = await response.json();
                    alert(`Failed to delete video course: ${errorData.error || 'Unknown error'}`);
                  }
                } catch (error) {
                  console.error('Error deleting video course:', error);
                  alert('Failed to delete video course. Please try again.');
                }
              }
            }}
            onViewCourse={(videoCourseId) => console.log('View video course', videoCourseId)}
            formatDate={formatDate}
            formatDuration={(seconds) => seconds ? `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}` : 'N/A'}
            formatFileSize={(bytes) => bytes ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
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

        {/* Video Courses Modal */}
        <VideoCoursesModal
          isOpen={isVideoCoursesModalOpen}
          onClose={() => {
            setIsVideoCoursesModalOpen(false);
            setEditingVideoCourse(null);
          }}
          course={editingVideoCourse}
          onSave={async (videoCourseData: any) => {
            setIsCreatingVideoCourse(true);
            try {
              const isEditing = editingVideoCourse && editingVideoCourse._id;
              const url = isEditing 
                ? `/api/admin/video-courses/${editingVideoCourse._id}`
                : '/api/admin/video-courses';
              const method = isEditing ? 'PUT' : 'POST';

              const response = await fetch(url, {
                method,
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(videoCourseData),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} video course`);
              }

              // Refresh video courses data
              await fetchVideoCourses();
              
              // Close modal and reset editing state
              setIsVideoCoursesModalOpen(false);
              setEditingVideoCourse(null);
              
              // Show success message
              alert(`Video course ${isEditing ? 'updated' : 'created'} successfully!`);
            } catch (error) {
              console.error(`Error ${editingVideoCourse ? 'updating' : 'creating'} video course:`, error);
              alert(error instanceof Error ? error.message : `Failed to ${editingVideoCourse ? 'update' : 'create'} video course`);
            } finally {
              setIsCreatingVideoCourse(false);
            }
          }}
          isLoading={isCreatingVideoCourse}
        />

        {/* Email Reminder Modal */}
        <EmailReminderModal
          isOpen={isEmailReminderModalOpen}
          onClose={() => setIsEmailReminderModalOpen(false)}
          onSubmit={async (emailData: any) => {
            setIsEmailReminderSending(true);
            try {
              const response = await fetch('/api/admin/bulk-email-reminder', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(emailData),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send email reminder');
              }

              const result = await response.json();
              
              // Close modal
              setIsEmailReminderModalOpen(false);
              
              // Show success message
              alert(`Email reminder sent successfully to ${result.sentCount} members!`);
            } catch (error) {
              console.error('Error sending email reminder:', error);
              alert(error instanceof Error ? error.message : 'Failed to send email reminder');
            } finally {
              setIsEmailReminderSending(false);
            }
          }}
          loading={isEmailReminderSending}
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

        {/* Email Reminders Tab */}
        {activeTab === 'email-reminders' && (
          <div className="space-y-6">
            <div className="bg-card shadow rounded-lg border border-border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-foreground">
                      Email Reminders & Announcements
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Send reminders and announcements to all members with professional templates
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEmailReminderModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </button>
                </div>
                
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-muted overflow-hidden shadow rounded-lg border border-border">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-muted-foreground truncate">
                              Event Reminders
                            </dt>
                            <dd className="text-lg font-medium text-foreground">
                              Upcoming Events
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted overflow-hidden shadow rounded-lg border border-border">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Bell className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-muted-foreground truncate">
                              General Announcements
                            </dt>
                            <dd className="text-lg font-medium text-foreground">
                              Club Updates
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted overflow-hidden shadow rounded-lg border border-border">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Award className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-muted-foreground truncate">
                              Certification Reminders
                            </dt>
                            <dd className="text-lg font-medium text-foreground">
                              Deadlines & Updates
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-foreground mt-4">
                {showConfirmDialog.action === 'delete'
                  ? 'Delete Member'
                  : `Mark as ${showConfirmDialog.action === 'paid' ? 'Paid' : 'Unpaid'}`
                }
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-muted-foreground">
                  {showConfirmDialog.action === 'delete'
                    ? `Are you sure you want to delete ${showConfirmDialog.memberName}? This action cannot be undone.`
                    : `Are you sure you want to mark ${showConfirmDialog.memberName} as ${showConfirmDialog.action}?`
                  }
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowConfirmDialog(null)}
                  className="px-4 py-2 bg-muted text-foreground text-base font-medium rounded-md w-24 mr-2 hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
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

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}