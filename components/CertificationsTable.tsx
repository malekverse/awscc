'use client';

import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Award, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface Certification {
  _id: string;
  name: string;
  description: string;
  provider: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  validityPeriod: number; // in months
  requirements: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedCount?: number;
}

interface CertificationsTableProps {
  certifications: Certification[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  levelFilter: string;
  setLevelFilter: (level: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  onCreateCertification: () => void;
  onEditCertification: (certification: Certification) => void;
  onDeleteCertification: (certificationId: string) => void;
  onViewMembers: (certificationId: string) => void;
  formatDate: (date: string) => string;
}

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'foundational':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'associate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'professional':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    case 'specialty':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function CertificationsTable({
  certifications,
  searchTerm,
  setSearchTerm,
  levelFilter,
  setLevelFilter,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onCreateCertification,
  onEditCertification,
  onDeleteCertification,
  onViewMembers,
  formatDate
}: CertificationsTableProps) {
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
      selectedCertifications.length === certifications.length ? [] : certifications.map(c => c._id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Certifications</h2>
          <p className="text-muted-foreground">Manage available certifications and requirements</p>
        </div>
        <button
          onClick={onCreateCertification}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
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
              placeholder="Search certifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            />
          </div>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="all">All Categories</option>
            <option value="aws">AWS</option>
            <option value="cloud">Cloud Computing</option>
            <option value="devops">DevOps</option>
            <option value="security">Security</option>
            <option value="data">Data & Analytics</option>
            <option value="ai">AI/ML</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="level-asc">Level (Low to High)</option>
            <option value="level-desc">Level (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Certifications Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCertifications.length === certifications.length && certifications.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Certification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Validity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assigned
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
              {certifications.map((certification) => (
                <tr key={certification._id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCertifications.includes(certification._id)}
                      onChange={() => toggleCertificationSelection(certification._id)}
                      className="rounded border text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {certification.name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {certification.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {certification.provider}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(certification.level)}`}>
                      {certification.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {certification.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                      {certification.validityPeriod} months
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <button
                      onClick={() => onViewMembers(certification._id)}
                      className="flex items-center text-primary hover:text-primary/80"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      {certification.assignedCount || 0}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      certification.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {certification.isActive ? (
                        <><CheckCircle className="h-3 w-3 mr-1" />Active</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" />Inactive</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => onEditCertification(certification)}
                      className="text-primary hover:text-primary/80"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCertification(certification._id)}
                      className="text-destructive hover:text-destructive/80"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {certifications.length === 0 && (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">No certifications found</h3>
            <p className="mt-1 text-muted-foreground">Get started by creating your first certification</p>
          </div>
        )}
      </div>
    </div>
  );
}