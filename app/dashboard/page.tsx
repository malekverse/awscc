'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Calendar, 
  Building, 
  LogOut, 
  Shield, 
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Award,
  Bell,
  TrendingUp,
  Target,
  Star,
  Download,
  Play,
  FileText,
  Code,
  Database,
  Server,
  Zap,
  Cloud,
  Lock,
  Globe,
  BarChart3,
  Trophy,
  Medal,
  GraduationCap
} from 'lucide-react';

interface MemberInfo {
  id: string;
  email: string;
  fullName: string;
  organization?: string;
  lastLogin?: string;
  paidDate?: string;
}

interface ProgressData {
  completedCourses: number;
  totalCourses: number;
  completedWorkshops: number;
  totalWorkshops: number;
  eventsAttended: number;
  totalEvents: number;
  certificatesEarned: number;
}

interface Certificate {
  id: string;
  name: string;
  description: string;
  earnedDate: string;
  type: 'course' | 'workshop' | 'challenge' | 'certification';
  badgeUrl?: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  url: string;
}

interface VideoResource {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
}

interface CheatSheet {
  id: string;
  title: string;
  description: string;
  category: string;
  downloadUrl: string;
  fileSize: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'workshop' | 'seminar' | 'networking' | 'certification';
  capacity?: number;
  registeredCount: number;
  availableSpots?: number;
  totalSpots?: number;
  isRegistered: boolean;
  registrationStatus?: string;
  status: 'available' | 'full' | 'registration_closed' | 'completed';
  instructor?: string;
  prerequisites?: string[];
  difficulty?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  isVirtual?: boolean;
  virtualLink?: string;
  registrationDeadline?: string;
  certificateOffered?: boolean;
  agenda?: string[];
  materials?: string[];
  tags?: string[];
}

export default function MemberDashboard() {
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState<Event[]>([]);
  const [reservationLoading, setReservationLoading] = useState<string | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
   
  // Mock data for demonstration - in real app, this would come from API
  const progressData: ProgressData = {
    completedCourses: 8,
    totalCourses: 15,
    completedWorkshops: 3,
    totalWorkshops: 6,
    eventsAttended: 5,
    totalEvents: 8,
    certificatesEarned: 4
  };
  
  const certificates: Certificate[] = [
    {
      id: '1',
      name: 'AWS Cloud Practitioner',
      description: 'Foundational understanding of AWS Cloud',
      earnedDate: '2024-01-15',
      type: 'certification'
    },
    {
      id: '2',
      name: 'Docker Workshop Completion',
      description: 'Completed advanced Docker containerization workshop',
      earnedDate: '2024-02-20',
      type: 'workshop'
    },
    {
      id: '3',
      name: 'Kubernetes Challenge Winner',
      description: 'First place in Kubernetes deployment challenge',
      earnedDate: '2024-03-10',
      type: 'challenge'
    },
    {
      id: '4',
      name: 'DevOps Fundamentals',
      description: 'Completed comprehensive DevOps course',
      earnedDate: '2024-03-25',
      type: 'course'
    }
  ];
  
  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Getting Started with AWS EC2',
      description: 'Learn how to launch and manage EC2 instances',
      category: 'AWS',
      difficulty: 'beginner',
      duration: '30 min',
      url: '#'
    },
    {
      id: '2',
      title: 'Advanced Docker Networking',
      description: 'Deep dive into Docker networking concepts',
      category: 'Docker',
      difficulty: 'advanced',
      duration: '45 min',
      url: '#'
    },
    {
      id: '3',
      title: 'Kubernetes Pod Management',
      description: 'Managing pods in Kubernetes clusters',
      category: 'Kubernetes',
      difficulty: 'intermediate',
      duration: '35 min',
      url: '#'
    }
  ];
  
  const videoResources: VideoResource[] = [
    {
      id: '1',
      title: 'AWS Lambda Masterclass',
      description: 'Complete guide to serverless computing with AWS Lambda',
      difficulty: 'intermediate',
      duration: '2h 30min',
      thumbnailUrl: '/placeholder.jpg',
      videoUrl: '#'
    },
    {
      id: '2',
      title: 'DevOps Pipeline Setup',
      description: 'Building CI/CD pipelines from scratch',
      difficulty: 'advanced',
      duration: '1h 45min',
      thumbnailUrl: '/placeholder.jpg',
      videoUrl: '#'
    },
    {
      id: '3',
      title: 'Cloud Security Basics',
      description: 'Essential security practices for cloud environments',
      difficulty: 'beginner',
      duration: '1h 15min',
      thumbnailUrl: '/placeholder.jpg',
      videoUrl: '#'
    }
  ];
  
  const cheatSheets: CheatSheet[] = [
    {
      id: '1',
      title: 'AWS CLI Commands Reference',
      description: 'Essential AWS CLI commands for daily use',
      category: 'AWS',
      downloadUrl: '#',
      fileSize: '2.1 MB'
    },
    {
      id: '2',
      title: 'Docker Commands Cheat Sheet',
      description: 'Quick reference for Docker commands',
      category: 'Docker',
      downloadUrl: '#',
      fileSize: '1.8 MB'
    },
    {
      id: '3',
      title: 'S3 Storage Classes Comparison',
      description: 'Quick reference for S3 storage classes and pricing',
      category: 'S3',
      downloadUrl: '#',
      fileSize: '1.2 MB'
    }
  ];

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      setEventsError(null);
      
      const response = await fetch('/api/events?upcoming=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const result = await response.json();
      if (result.success) {
        setEvents(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEventsError(error instanceof Error ? error.message : 'Failed to fetch events');
    } finally {
      setEventsLoading(false);
    }
  };
   
  const router = useRouter();

  // Event reservation handler
  const handleEventReservation = async (eventId: string) => {
    setReservationLoading(eventId);
    
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');
      
      const method = event.isRegistered ? 'DELETE' : 'POST';
      const response = await fetch(`/api/events/${eventId}/register`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Failed to ${event.isRegistered ? 'cancel registration' : 'register'} for event`);
      }
      
      // Refresh events data to get updated registration status
      await fetchEvents();
      
      // Show success message (you can implement toast notifications here)
      console.log(result.message);
      
    } catch (error) {
      console.error('Error updating event registration:', error);
      // Show error message (you can implement toast notifications here)
      alert(error instanceof Error ? error.message : 'Failed to update event registration');
    } finally {
      setReservationLoading(null);
    }
  };

  // Check authentication and fetch member data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.status === 401 || response.status === 403) {
          router.push('/login');
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          setMember(data.member);
          // Fetch real events data
      fetchEvents();
        } else {
          setError('Failed to load dashboard');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getCertificateIcon = (type: string) => {
    switch (type) {
      case 'certification': return Trophy;
      case 'workshop': return Users;
      case 'challenge': return Target;
      case 'course': return GraduationCap;
      default: return Award;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">Member Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Progress Metrics */}
        <div className="mb-8">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back, {member?.fullName || 'Member'}!
                </h2>
                <p className="text-muted-foreground">
                  Here's your learning progress and achievements
                </p>
              </div>
            </div>
            
            {/* Progress Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{progressData.certificatesEarned}</p>
                    <p className="text-sm text-muted-foreground">Certificates Earned</p>
                  </div>
                </div>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{calculateProgress(progressData.completedCourses, progressData.totalCourses)}%</p>
                    <p className="text-sm text-muted-foreground">Course Progress</p>
                  </div>
                </div>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{progressData.eventsAttended}</p>
                    <p className="text-sm text-muted-foreground">Events Attended</p>
                  </div>
                </div>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{progressData.completedWorkshops}</p>
                    <p className="text-sm text-muted-foreground">Workshops Completed</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-background rounded-lg p-1 border border-border">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'progress', label: 'Progress', icon: TrendingUp },
                { id: 'events', label: 'Events', icon: Calendar },
                { id: 'certificates', label: 'Certificates', icon: Trophy },
                { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
                { id: 'videos', label: 'Video Courses', icon: Play },
                { id: 'resources', label: 'Resources', icon: Download }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Member Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-sm text-foreground">{member?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-sm text-foreground">{member?.organization || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-sm text-foreground">Last login: {formatDate(member?.lastLogin)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">Membership Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm text-foreground">Active Member</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-sm text-foreground">Member since: {formatDate(member?.paidDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-sm text-foreground">Premium Access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
                  <h3 className="text-lg font-semibold text-foreground">Learning Resources</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Access our comprehensive library of AWS tutorials, guides, and documentation.
                </p>
                <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                  Browse Resources
                </button>
              </div>

              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center mb-4">
                  <Bell className="h-8 w-8 text-orange-500 mr-3" />
                  <h3 className="text-lg font-semibold text-foreground">Latest Announcements</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Stay updated with the latest news, events, and opportunities from AWSCC.
                </p>
                <button className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors">
                  View Announcements
                </button>
              </div>

              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-green-500 mr-3" />
                  <h3 className="text-lg font-semibold text-foreground">Community</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Connect with fellow members, share knowledge, and collaborate on projects.
                </p>
                <button className="w-full bg-accent text-accent-foreground py-2 px-4 rounded-md hover:bg-accent/80 transition-colors">
                  Join Community
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="flex items-center justify-center p-4 bg-background border border-border rounded-lg hover:bg-muted transition-colors">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-sm font-medium text-foreground">View Events</span>
                </button>
                <button className="flex items-center justify-center p-4 bg-background border border-border rounded-lg hover:bg-muted transition-colors">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-sm font-medium text-foreground">Start Learning</span>
                </button>
                <button className="flex items-center justify-center p-4 bg-background border border-border rounded-lg hover:bg-muted transition-colors">
                  <Award className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-sm font-medium text-foreground">View Certificates</span>
                </button>
                <button className="flex items-center justify-center p-4 bg-background border border-border rounded-lg hover:bg-muted transition-colors">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-sm font-medium text-foreground">Join Workshop</span>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Learning Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-foreground">Courses</h4>
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">{progressData.completedCourses}/{progressData.totalCourses}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${calculateProgress(progressData.completedCourses, progressData.totalCourses)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {calculateProgress(progressData.completedCourses, progressData.totalCourses)}% completed
                  </p>
                </div>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-foreground">Workshops</h4>
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">{progressData.completedWorkshops}/{progressData.totalWorkshops}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${calculateProgress(progressData.completedWorkshops, progressData.totalWorkshops)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {calculateProgress(progressData.completedWorkshops, progressData.totalWorkshops)}% completed
                  </p>
                </div>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-foreground">Events</h4>
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attended</span>
                    <span className="text-foreground">{progressData.eventsAttended}/{progressData.totalEvents}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${calculateProgress(progressData.eventsAttended, progressData.totalEvents)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {calculateProgress(progressData.eventsAttended, progressData.totalEvents)}% attendance rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">Upcoming Events</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {events.filter(e => e.status === 'available' || e.status === 'full').length} upcoming events
                </span>
              </div>
            </div>
            
            {/* Event Filters */}
            <div className="flex flex-wrap gap-2">
              {['all', 'workshop', 'seminar', 'networking', 'certification'].map((filter) => (
                <button
                  key={filter}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors capitalize"
                >
                  {filter === 'all' ? 'All Events' : filter}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {eventsLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading events...</span>
              </div>
            )}

            {/* Error State */}
            {eventsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800">{eventsError}</p>
                </div>
                <button 
                  onClick={fetchEvents}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Events Grid */}
            {!eventsLoading && !eventsError && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((event) => {
                const isAvailable = event.status === 'available';
                const isFull = event.status === 'full' || (event.totalSpots && event.registeredCount >= event.totalSpots);
                const canRegister = isAvailable && !isFull;
                
                return (
                  <div key={event.id} className={`bg-card rounded-lg shadow-sm border border-border p-6 ${
                    event.status === 'completed' ? 'opacity-75' : ''
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          event.type === 'workshop' ? 'bg-blue-100 text-blue-600' :
                          event.type === 'seminar' ? 'bg-green-100 text-green-600' :
                          event.type === 'networking' ? 'bg-purple-100 text-purple-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {event.type === 'workshop' && <Users className="h-5 w-5" />}
                          {event.type === 'seminar' && <BookOpen className="h-5 w-5" />}
                          {event.type === 'networking' && <Users className="h-5 w-5" />}
                          {event.type === 'certification' && <Award className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">{event.title}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{event.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'available' ? 'bg-green-100 text-green-700' :
                        event.status === 'full' ? 'bg-red-100 text-red-700' :
                        event.status === 'registration_closed' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {event.status === 'available' ? 'Available' :
                         event.status === 'full' ? 'Full' :
                         event.status === 'registration_closed' ? 'Registration Closed' :
                         'Completed'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                    
                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      {event.instructor && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          Instructor: {event.instructor}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {event.registeredCount}{event.totalSpots ? `/${event.totalSpots}` : ''} registered
                        {event.availableSpots !== undefined && event.availableSpots !== null && (
                          <span className="text-green-600 ml-1">({event.availableSpots} spots left)</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Prerequisites */}
                    {event.prerequisites && event.prerequisites.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-foreground mb-2">Prerequisites:</p>
                        <div className="flex flex-wrap gap-1">
                          {event.prerequisites.map((prereq, index) => (
                            <span key={index} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                              {prereq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Registration Progress */}
                    {event.totalSpots && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Registration</span>
                          <span className="text-foreground">{event.registeredCount}/{event.totalSpots}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isFull ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(event.registeredCount / event.totalSpots) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Button */}
                    {isUpcoming && (
                      <button
                        onClick={() => handleEventReservation(event.id)}
                        disabled={!canRegister || reservationLoading === event.id}
                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                          event.isRegistered
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : canRegister
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        {reservationLoading === event.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : event.isRegistered ? (
                          'Cancel Registration'
                        ) : isFull ? (
                          'Event Full'
                        ) : (
                          'Register Now'
                        )}
                      </button>
                    )}
                    
                    {event.status === 'completed' && (
                      <div className="w-full py-2 px-4 rounded-md bg-muted text-muted-foreground text-center font-medium">
                        Event Completed
                      </div>
                    )}
                  </div>
                );
              })}
              
              {events.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Events Available</h3>
                  <p className="text-muted-foreground">Check back later for upcoming events and workshops.</p>
                </div>
              )}
            </div>
            )}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Your Certificates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => {
                const IconComponent = getCertificateIcon(cert.type);
                return (
                  <div key={cert.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <IconComponent className="h-8 w-8 text-yellow-500 mr-3" />
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{cert.type}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(cert.earnedDate)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{cert.description}</p>
                    <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                      View Certificate
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'tutorials' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">AWS Tutorials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial) => (
                <div key={tutorial.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Code className="h-6 w-6 text-blue-500 mr-3" />
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{tutorial.title}</h4>
                        <p className="text-sm text-muted-foreground">{tutorial.category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                      {tutorial.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{tutorial.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {tutorial.duration}
                    </span>
                    <button className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                      Start Tutorial
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Video Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoResources.map((video) => (
                <div key={video.id} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-foreground">{video.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty)}`}>
                        {video.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{video.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {video.duration}
                      </span>
                      <button className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Downloadable Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cheatSheets.map((sheet) => (
                <div key={sheet.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-green-500 mr-3" />
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{sheet.title}</h4>
                        <p className="text-sm text-muted-foreground">{sheet.category}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{sheet.fileSize}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{sheet.description}</p>
                  <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <br/>

        {/* Account Information - Always visible at bottom */}
        {activeTab === 'overview' && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Member ID</dt>
                <dd className="mt-1 text-sm text-foreground">{member?.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="mt-1 text-sm text-foreground">{member?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Organization</dt>
                <dd className="mt-1 text-sm text-foreground">{member?.organization || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Join Date</dt>
                <dd className="mt-1 text-sm text-foreground">{formatDate(member?.paidDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Login</dt>
                <dd className="mt-1 text-sm text-foreground">{formatDate(member?.lastLogin)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Account Type</dt>
                <dd className="mt-1 text-sm text-foreground">Premium Member</dd>
              </div>
            </dl>
          </div>
        )}
      </main>
    </div>
  );
}