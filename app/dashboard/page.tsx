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

export default function MemberDashboard() {
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
   
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
   
  const router = useRouter();

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