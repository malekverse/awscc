'use client';

import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  type: 'workshop' | 'webinar' | 'conference' | 'meetup' | 'training' | 'other';
  date: string;
  time: string;
  location: {
    venue: string;
    address: string;
    city: string;
    isOnline: boolean;
  };
  capacity: number;
  registrationDeadline: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  registrationCount?: number;
}

interface EventsTableProps {
  events: Event[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  onCreateEvent: () => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onViewRegistrations: (eventId: string) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'workshop': return 'bg-primary/10 text-primary';
    case 'webinar': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'conference': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'meetup': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
    case 'training': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'other': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getEventStatus = (event: Event) => {
  const now = new Date();
  const eventDate = new Date(event.date);
  const registrationDeadline = new Date(event.registrationDeadline);
  
  if (!event.isActive) return { status: 'cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' };
  if (eventDate < now) return { status: 'completed', color: 'bg-muted text-muted-foreground' };
  if (registrationDeadline < now) return { status: 'registration closed', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' };
  if (event.registrationCount && event.registrationCount >= event.capacity) {
    return { status: 'full', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' };
  }
  return { status: 'open', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' };
};

export default function EventsTable({
  events,
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  locationFilter,
  setLocationFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onViewRegistrations,
  formatDate,
  formatCurrency
}: EventsTableProps) {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedEvents(
      selectedEvents.length === events.length ? [] : events.map(e => e._id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Events</h2>
          <p className="text-muted-foreground">Manage workshops, seminars, and networking events</p>
        </div>
        <button
          onClick={onCreateEvent}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="bg-background p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="all">All Types</option>
            <option value="workshop">Workshop</option>
                <option value="webinar">Webinar</option>
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="full">Full</option>
            <option value="registration closed">Registration Closed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="all">All Locations</option>
            <option value="online">Online</option>
            <option value="in-person">In-Person</option>
          </select>

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
            <option value="date-asc">Date (Earliest First)</option>
            <option value="date-desc">Date (Latest First)</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="registrationCount-desc">Most Registered</option>
            <option value="registrationCount-asc">Least Registered</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-background rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedEvents.length === events.length && events.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {events.map((event) => {
                const eventStatus = getEventStatus(event);
                return (
                  <tr key={event._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event._id)}
                        onChange={() => toggleEventSelection(event._id)}
                        className="rounded border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {event.imageUrl ? (
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center mr-3">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {event.title}
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {event.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                        <div>
                          <div>{formatDate(event.date)}</div>
                          <div className="text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {event.time}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                        <div>
                          <div className="font-medium">
                            {event.isVirtual ? 'Online' : (event.location || 'TBD')}
                          </div>
                          {!event.isVirtual && event.location && (
                            <div className="text-muted-foreground text-xs">
                              {event.virtualLink ? 'Virtual Event' : 'In-Person'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <button
                        onClick={() => onViewRegistrations(event._id)}
                        className="flex items-center text-primary hover:text-primary/80"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        {event.registrationCount || 0}/{event.capacity}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {event.price === 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
                      ) : (
                        formatCurrency(event.price)
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${eventStatus.color}`}>
                        {eventStatus.status === 'open' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {eventStatus.status === 'full' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {eventStatus.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                        {eventStatus.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {eventStatus.status === 'registration closed' && <Clock className="h-3 w-3 mr-1" />}
                        {eventStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => onEditEvent(event)}
                        className="text-primary hover:text-primary/80"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteEvent(event._id)}
                        className="text-destructive hover:text-destructive/80"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {event.imageUrl && (
                        <a
                          href={event.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                          title="View Image"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
            <p className="text-muted-foreground">Get started by creating your first event.</p>
          </div>
        )}
      </div>
    </div>
  );
}