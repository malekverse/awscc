export interface Member {
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

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AnalyticsData {
  registrationTrend: Array<{ date: string; count: number }>;
  paymentStatus: Array<{ name: string; value: number; color: string }>;
  organizationStats: Array<{ name: string; count: number }>;
  monthlyStats: Array<{ month: string; registered: number; paid: number }>;
}

export interface DashboardStats {
  totalMembers: number;
  paidMembers: number;
  unpaidMembers: number;
  recentRegistrations: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface EmailTemplate {
  subject: string;
  content: string;
}

export interface EmailTemplates {
  welcome: EmailTemplate;
  reminder: EmailTemplate;
  announcement: EmailTemplate;
  event: EmailTemplate;
}