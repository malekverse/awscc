'use client';

import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Calendar as CalendarIcon, 
  Building2, 
  Check, 
  X, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Users 
} from 'lucide-react';
import { Member, PaginationInfo } from '../types/dashboard';

interface MembersTableProps {
  filteredMembers: Member[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  paidFilter: string;
  setPaidFilter: (filter: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  selectedMembers: string[];
  toggleSelectAll: () => void;
  toggleMemberSelection: (id: string) => void;
  handleBulkAction: (action: string) => void;
  actionLoading: string | null;
  setShowConfirmDialog: (dialog: any) => void;
  pagination: PaginationInfo | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  formatDate: (date: string) => string;
}

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

export default function MembersTable({
  filteredMembers,
  searchTerm,
  setSearchTerm,
  paidFilter,
  setPaidFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedMembers,
  toggleSelectAll,
  toggleMemberSelection,
  handleBulkAction,
  actionLoading,
  setShowConfirmDialog,
  pagination,
  currentPage,
  setCurrentPage,
  formatDate
}: MembersTableProps) {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={paidFilter}
              onChange={(e) => setPaidFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="submissionDate-desc">Newest First</option>
              <option value="submissionDate-asc">Oldest First</option>
              <option value="fullName-asc">Name A-Z</option>
              <option value="fullName-desc">Name Z-A</option>
            </select>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedMembers.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('paid')}
                  disabled={actionLoading === 'bulk'}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 disabled:opacity-50"
                >
                  Mark Paid
                </button>
                <button
                  onClick={() => handleBulkAction('unpaid')}
                  disabled={actionLoading === 'bulk'}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50"
                >
                  Mark Unpaid
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  disabled={actionLoading === 'bulk'}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredMembers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member._id)}
                          onChange={() => toggleMemberSelection(member._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {member.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.fullName}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{member.organization || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.paid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {member.paid ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {member.paid ? 'Paid' : 'Unpaid'}
                          </span>
                          {member.emailSent && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Mail className="h-3 w-3 mr-1" />
                              Email Sent
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {formatDate(member.submissionDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setShowConfirmDialog({
                              show: true,
                              memberId: member._id,
                              action: member.paid ? 'unpaid' : 'paid',
                              memberName: member.fullName
                            })}
                            disabled={actionLoading === member._id}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                              member.paid
                                ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                                : 'text-green-700 bg-green-100 hover:bg-green-200'
                            } disabled:opacity-50`}
                          >
                            {actionLoading === member._id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                            ) : member.paid ? (
                              <X className="h-3 w-3 mr-1" />
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            {member.paid ? 'Mark Unpaid' : 'Mark Paid'}
                          </button>
                          <button
                            onClick={() => setShowConfirmDialog({
                              show: true,
                              memberId: member._id,
                              action: 'delete',
                              memberName: member.fullName
                            })}
                            disabled={actionLoading === member._id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * pagination.limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pagination.limit, pagination.totalCount)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.totalCount}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12">
            <EmptyState
              title="No members found"
              description="Try adjusting your search or filter criteria"
              icon={Users}
            />
          </div>
        )}
      </div>
    </div>
  );
}