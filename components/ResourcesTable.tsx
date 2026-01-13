'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  FileText,
  Image,
  Video,
  File,
  ExternalLink
} from 'lucide-react';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'document' | 'image' | 'video' | 'link' | 'other';
  category: string;
  fileUrl?: string;
  linkUrl?: string;
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  updatedAt: string;
}

interface ResourcesTableProps {
  resources: Resource[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  onCreateResource: () => void;
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (resourceId: string) => void;
  onDownloadResource: (resource: Resource) => void;
  formatDate: (date: string) => string;
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'document': return FileText;
    case 'image': return Image;
    case 'video': return Video;
    case 'link': return ExternalLink;
    default: return File;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'document': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'image': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'video': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'link': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function ResourcesTable({
  resources,
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onCreateResource,
  onEditResource,
  onDeleteResource,
  onDownloadResource,
  formatDate
}: ResourcesTableProps) {
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedResources(
      selectedResources.length === resources.length ? [] : resources.map(r => r._id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Resources</h2>
          <p className="text-muted-foreground">Manage learning resources and materials</p>
        </div>
        <button
          onClick={onCreateResource}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="all">All Types</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="link">Links</option>
            <option value="other">Other</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="all">All Categories</option>
            <option value="aws">AWS</option>
            <option value="cloud">Cloud Computing</option>
            <option value="devops">DevOps</option>
            <option value="ai">AI/ML</option>
            <option value="programming">Programming</option>
            <option value="tutorial">Tutorials</option>
            <option value="documentation">Documentation</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="downloadCount-desc">Most Downloaded</option>
            <option value="downloadCount-asc">Least Downloaded</option>
          </select>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedResources.length === resources.length && resources.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {resources.map((resource) => {
                const IconComponent = getResourceIcon(resource.type);
                return (
                  <tr key={resource._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(resource._id)}
                        onChange={() => toggleResourceSelection(resource._id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <IconComponent className="h-5 w-5 text-muted-foreground mr-3" />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {resource.title}
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {resource.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(resource.type)}`}>
                        {resource.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {resource.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {resource.downloadCount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        resource.isPublic 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {resource.isPublic ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(resource.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => onDownloadResource(resource)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditResource(resource)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteResource(resource._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {resources.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No resources found</h3>
            <p className="text-muted-foreground">Get started by creating your first resource.</p>
          </div>
        )}
      </div>
    </div>
  );
}