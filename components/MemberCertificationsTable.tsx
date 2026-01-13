'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Award, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  X
} from 'lucide-react';

interface MemberCertification {
  _id: string;
  memberId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  certificationId: {
    _id: string;
    name: string;
    provider: string;
    level: string;
    validityPeriod: number;
  };
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked' | 'pending';
  issuedBy: string;
  revokedBy?: string;
  revokedAt?: string;
  revokeReason?: string;
  renewalCount: number;
  createdAt: string;
  updatedAt: string;
}

interface MemberCertificationsTableProps {
  memberCertifications: MemberCertification[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  certificationFilter: string;
  setCertificationFilter: (certification: string) => void;
  memberFilter: string;
  setMemberFilter: (member: string) => void;
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  onIssueCertification: () => void;
  onRenewCertification: (certificationId: string) => void;
  onRevokeCertification: (certificationId: string) => void;
  onDownloadCertificate: (certificationId: string) => void;
  onViewMember: (memberId: string) => void;
  formatDate: (date: string) => string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'expired':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'revoked':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'pending':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Foundational':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'Associate':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'Professional':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'Expert':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const isExpiringSoon = (expiryDate: string) => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
  return expiry <= thirtyDaysFromNow && expiry > now;
};

export default function MemberCertificationsTable({
  memberCertifications,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  certificationFilter,
  setCertificationFilter,
  memberFilter,
  setMemberFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onIssueCertification,
  onRenewCertification,
  onRevokeCertification,
  onDownloadCertificate,
  onViewMember,
  formatDate
}: MemberCertificationsTableProps) {
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);

  // Filter and sort certifications
  const filteredCertifications = memberCertifications.filter(cert => {
    const matchesSearch = searchTerm === '' || 
      cert.memberId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.memberId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.memberId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificationId.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    const matchesCertification = certificationFilter === 'all' || cert.certificationId.name === certificationFilter;
    const matchesMember = memberFilter === '' ||
      cert.memberId.firstName.toLowerCase().includes(memberFilter.toLowerCase()) ||
      cert.memberId.lastName.toLowerCase().includes(memberFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesCertification && matchesMember;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'member':
        aValue = `${a.memberId.firstName} ${a.memberId.lastName}`;
        bValue = `${b.memberId.firstName} ${b.memberId.lastName}`;
        break;
      case 'certification':
        aValue = a.certificationId.name;
        bValue = b.certificationId.name;
        break;
      case 'issueDate':
        aValue = new Date(a.issueDate);
        bValue = new Date(b.issueDate);
        break;
      case 'expiryDate':
        aValue = new Date(a.expiryDate);
        bValue = new Date(b.expiryDate);
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = a.issueDate;
        bValue = b.issueDate;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleCertificationSelection = (certificationId: string) => {
    setSelectedCertifications(prev => 
      prev.includes(certificationId) 
        ? prev.filter(id => id !== certificationId)
        : [...prev, certificationId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCertifications(
      selectedCertifications.length === filteredCertifications.length 
        ? [] 
        : filteredCertifications.map(mc => mc._id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Member Certifications</h2>
          <p className="text-muted-foreground">Manage issued certifications and track member progress</p>
        </div>
        <button
          onClick={onIssueCertification}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Issue Certification
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search by member or certification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
            <option value="pending">Pending</option>
          </select>

          {/* Certification Filter */}
          <select
            value={certificationFilter}
            onChange={(e) => setCertificationFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="all">All Certifications</option>
            {Array.from(new Set(memberCertifications.map(mc => mc.certificationId.name))).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {/* Member Filter */}
          <input
            type="text"
            placeholder="Filter by member..."
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          />

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="issueDate-desc">Issue Date (Newest)</option>
            <option value="issueDate-asc">Issue Date (Oldest)</option>
            <option value="expiryDate-asc">Expiry Date (Soonest)</option>
            <option value="expiryDate-desc">Expiry Date (Latest)</option>
            <option value="member-asc">Member (A-Z)</option>
            <option value="member-desc">Member (Z-A)</option>
            <option value="certification-asc">Certification (A-Z)</option>
            <option value="certification-desc">Certification (Z-A)</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="status-desc">Status (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedCertifications.length === filteredCertifications.length && filteredCertifications.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Certification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Certificate #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredCertifications.map((memberCert) => (
                <tr key={memberCert._id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCertifications.includes(memberCert._id)}
                      onChange={() => toggleCertificationSelection(memberCert._id)}
                      className="rounded border text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-muted-foreground mr-3" />
                      <div>
                        <button
                          onClick={() => onViewMember(memberCert.memberId._id)}
                          className="text-sm font-medium text-primary hover:text-primary/80"
                        >
                          {memberCert.memberId.firstName} {memberCert.memberId.lastName}
                        </button>
                        <div className="text-sm text-muted-foreground">
                          {memberCert.memberId.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-yellow-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {memberCert.certificationId.name}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {memberCert.certificationId.provider}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(memberCert.certificationId.level)}`}>
                            {memberCert.certificationId.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-mono">
                    {memberCert.certificateNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                      {formatDate(memberCert.issueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className={isExpiringSoon(memberCert.expiryDate) ? 'text-orange-600 font-medium' : ''}>
                        {formatDate(memberCert.expiryDate)}
                      </span>
                      {isExpiringSoon(memberCert.expiryDate) && (
                        <AlertTriangle className="h-4 w-4 text-orange-500 ml-1" title="Expiring soon" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(memberCert.status)}`}>
                      {memberCert.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {memberCert.status === 'expired' && <Clock className="h-3 w-3 mr-1" />}
                      {memberCert.status === 'revoked' && <XCircle className="h-3 w-3 mr-1" />}
                      {memberCert.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {memberCert.status}
                    </span>
                    {memberCert.renewalCount > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Renewed {memberCert.renewalCount} time{memberCert.renewalCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onDownloadCertificate(memberCert._id)}
                        className="text-primary hover:text-primary/80"
                        title="Download Certificate"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {(memberCert.status === 'expired' || memberCert.status === 'active') && (
                        <button
                          onClick={() => onRenewCertification(memberCert._id)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          title="Renew Certification"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                      {memberCert.status === 'active' && (
                        <button
                          onClick={() => onRevokeCertification(memberCert._id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Revoke Certification"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCertifications.length === 0 && (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No certifications found</h3>
            <p className="text-muted-foreground">Start by issuing certifications to members.</p>
          </div>
        )}
      </div>
    </div>
  );
}