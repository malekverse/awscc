'use client';

import { useState } from 'react';
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
  RefreshCw
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
    case 'active': return 'bg-green-100 text-green-800';
    case 'expired': return 'bg-yellow-100 text-yellow-800';
    case 'revoked': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'beginner': return 'bg-green-100 text-green-800';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'advanced': return 'bg-orange-100 text-orange-800';
    case 'expert': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
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

  const toggleCertificationSelection = (certificationId: string) => {
    setSelectedCertifications(prev => 
      prev.includes(certificationId) 
        ? prev.filter(id => id !== certificationId)
        : [...prev, certificationId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedCertifications(
      selectedCertifications.length === memberCertifications.length 
        ? [] 
        : memberCertifications.map(mc => mc._id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Member Certifications</h2>
          <p className="text-gray-600">Manage issued certifications and track member progress</p>
        </div>
        <button
          onClick={onIssueCertification}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Issue Certification
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by member or certification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
            <option value="pending">Pending</option>
            <option value="expiring-soon">Expiring Soon</option>
          </select>

          {/* Certification Filter */}
          <select
            value={certificationFilter}
            onChange={(e) => setCertificationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Certifications</option>
            {/* This would be populated with actual certifications */}
            <option value="aws-cloud-practitioner">AWS Cloud Practitioner</option>
            <option value="aws-solutions-architect">AWS Solutions Architect</option>
            <option value="aws-developer">AWS Developer</option>
          </select>

          {/* Member Filter */}
          <input
            type="text"
            placeholder="Filter by member..."
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="issueDate-desc">Newest First</option>
            <option value="issueDate-asc">Oldest First</option>
            <option value="expiryDate-asc">Expiring Soon</option>
            <option value="expiryDate-desc">Expiring Later</option>
            <option value="memberName-asc">Member A-Z</option>
            <option value="memberName-desc">Member Z-A</option>
          </select>
        </div>
      </div>

      {/* Member Certifications Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCertifications.length === memberCertifications.length && memberCertifications.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {memberCertifications.map((memberCert) => (
                <tr key={memberCert._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCertifications.includes(memberCert._id)}
                      onChange={() => toggleCertificationSelection(memberCert._id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <button
                          onClick={() => onViewMember(memberCert.memberId._id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900"
                        >
                          {memberCert.memberId.firstName} {memberCert.memberId.lastName}
                        </button>
                        <div className="text-sm text-gray-500">
                          {memberCert.memberId.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-yellow-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {memberCert.certificationId.name}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {memberCert.certificationId.provider}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(memberCert.certificationId.level)}`}>
                            {memberCert.certificationId.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    {memberCert.certificateNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {formatDate(memberCert.issueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
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
                      <div className="text-xs text-gray-500 mt-1">
                        Renewed {memberCert.renewalCount} time{memberCert.renewalCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => onDownloadCertificate(memberCert._id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Download Certificate"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {(memberCert.status === 'expired' || memberCert.status === 'active') && (
                      <button
                        onClick={() => onRenewCertification(memberCert._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Renew"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    {memberCert.status === 'active' && (
                      <button
                        onClick={() => onRevokeCertification(memberCert._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Revoke"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {memberCertifications.length === 0 && (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certifications found</h3>
            <p className="text-gray-500">Start by issuing certifications to members.</p>
          </div>
        )}
      </div>
    </div>
  );
}