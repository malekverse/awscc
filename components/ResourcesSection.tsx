'use client';

import { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Play, 
  ExternalLink, 
  Search, 
  Filter,
  BookOpen,
  Video,
  Link as LinkIcon,
  Clock,
  Eye,
  Tag,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'link' | 'document' | 'video_course';
  url?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  viewCount: number;
  downloadCount: number;
  publishDate: string;
  createdAt: string;
}

interface ResourcesResponse {
  success: boolean;
  data: Resource[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    categories: string[];
    types: string[];
    difficulties: string[];
  };
}

export default function ResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [filters, setFilters] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch resources from API
  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);

      const response = await fetch(`/api/resources?${params.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }

      const result: ResourcesResponse = await response.json();
      
      if (result.success) {
        setResources(result.data);
        setPagination(result.pagination);
        setFilters(result.filters);
      } else {
        throw new Error('Failed to fetch resources');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  // Track resource view
  const trackView = async (resourceId: string) => {
    try {
      await fetch(`/api/resources/${resourceId}`, {
        method: 'GET',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };



  // Handle resource action (view, download, etc.)
  const handleResourceAction = async (resource: Resource) => {
    await trackView(resource._id);

    if (resource.type === 'document' && resource.fileUrl) {
      setDownloadingId(resource._id);
      try {
        // Get presigned download URL from API
        const response = await fetch(`/api/resources/${resource._id}/download`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to get download link');
        }

        const result = await response.json();
        if (result.success && result.downloadUrl) {
          // Open download link
          window.open(result.downloadUrl, '_blank');
        } else {
          throw new Error('Invalid download response');
        }
      } catch (error) {
        console.error('Error downloading resource:', error);
        setError('Failed to download resource. Please try again.');
      } finally {
        setDownloadingId(null);
      }
    } else if (resource.type === 'link' && resource.url) {
      window.open(resource.url, '_blank');
    } else if (resource.type === 'video_course' && resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  // Get resource icon
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'video_course':
        return <Video className="h-6 w-6 text-red-500" />;
      case 'link':
        return <LinkIcon className="h-6 w-6 text-green-500" />;
      default:
        return <BookOpen className="h-6 w-6 text-gray-500" />;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setCurrentPage(1);
  };

  // Effect to fetch resources when filters change
  useEffect(() => {
    fetchResources();
  }, [currentPage, selectedType, selectedCategory, selectedDifficulty]);

  // Effect to fetch resources when search term changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchResources();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  if (loading && resources.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-foreground">Learning Resources</h3>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-foreground">Learning Resources</h3>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchResources} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-2xl font-bold text-foreground">Learning Resources</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{pagination?.total || 0} resources available</span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {filters?.types?.map((type: string) => (
              <SelectItem key={type} value={type}>
                {type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {filters?.categories?.map((category: string) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {filters?.difficulties?.map((difficulty: string) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters button */}
      {(searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      )}

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No resources found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource._id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getResourceIcon(resource.type)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {resource.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{resource.category}</p>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(resource.difficulty)}>
                    {resource.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {resource.description}
                </p>

                {/* Tags */}
                {resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{resource.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{resource.viewCount}</span>
                    </div>
                    {resource.type === 'document' && (
                      <div className="flex items-center space-x-1">
                        <Download className="h-3 w-3" />
                        <span>{resource.downloadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(resource.publishDate)}</span>
                  </div>
                </div>

                {/* File size for documents */}
                {resource.type === 'document' && resource.fileSize && (
                  <p className="text-xs text-muted-foreground">
                    Size: {formatFileSize(resource.fileSize)}
                  </p>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => handleResourceAction(resource)}
                  className="w-full"
                  disabled={downloadingId === resource._id}
                >
                  {downloadingId === resource._id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : resource.type === 'document' ? (
                    <Download className="h-4 w-4 mr-2" />
                  ) : resource.type === 'video_course' ? (
                    <Play className="h-4 w-4 mr-2" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  {resource.type === 'document' ? 'Download' : 
                   resource.type === 'video_course' ? 'Watch' : 'Open Link'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  disabled={loading}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
            disabled={currentPage === pagination.pages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}