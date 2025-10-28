import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Plus, Edit2, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { supabase } from '../../lib/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'cancelled';
  publish_date: string;
  author_id: string;
  author_name: string;
  content_type: 'post' | 'page' | 'event' | 'announcement';
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  featured_image?: string;
  excerpt?: string;
  created_at: string;
  updated_at: string;
}

interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

const ContentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [eventForm, setEventForm] = useState<{
    title: string;
    content: string;
    status: 'draft' | 'scheduled' | 'published' | 'cancelled';
    publish_date: string;
    content_type: 'post' | 'page' | 'event' | 'announcement';
    tags: string;
    priority: 'low' | 'medium' | 'high';
    featured_image: string;
    excerpt: string;
  }>({
    title: '',
    content: '',
    status: 'draft',
    publish_date: '',
    content_type: 'post',
    tags: '',
    priority: 'medium',
    featured_image: '',
    excerpt: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_calendar')
        .select(`
          *,
          profiles!author_id(full_name)
        `)
        .order('publish_date');

      if (error) throw error;

      const eventsWithAuthorNames = data?.map(event => ({
        ...event,
        author_name: event.profiles
          ? event.profiles.full_name || 'Unknown Author'
          : 'Unknown Author'
      })) || [];

      setEvents(eventsWithAuthorNames);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = useCallback(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.content_type === typeFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const eventData = {
        title: eventForm.title,
        content: eventForm.content,
        status: eventForm.status,
        publish_date: eventForm.publish_date,
        content_type: eventForm.content_type,
        tags: eventForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        priority: eventForm.priority,
        featured_image: eventForm.featured_image,
        excerpt: eventForm.excerpt
      };

      if (selectedEvent) {
        const { error } = await supabase
          .from('content_calendar')
          .update(eventData)
          .eq('id', selectedEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('content_calendar')
          .insert([eventData]);

        if (error) throw error;
      }

      await loadEvents();
      resetEventForm();
      setShowEventForm(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      content: '',
      status: 'draft',
      publish_date: '',
      content_type: 'post',
      tags: '',
      priority: 'medium',
      featured_image: '',
      excerpt: ''
    });
  };

  const editEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      content: event.content,
      status: event.status,
      publish_date: event.publish_date,
      content_type: event.content_type,
      tags: event.tags.join(', '),
      priority: event.priority,
      featured_image: event.featured_image || '',
      excerpt: event.excerpt || ''
    });
    setShowEventForm(true);
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled content?')) return;

    try {
      const { error } = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const updateEventStatus = async (eventId: string, status: CalendarEvent['status']) => {
    try {
      const { error } = await supabase
        .from('content_calendar')
        .update({ status })
        .eq('id', eventId);

      if (error) throw error;

      await loadEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const getStatusIcon = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.publish_date);
        return eventDate.toDateString() === current.toDateString();
      });

      days.push({
        date: new Date(current),
        events: dayEvents,
        isToday: current.toDateString() === new Date().toDateString(),
        isCurrentMonth: current.getMonth() === month
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long'
    });
  };

  const calendarDays = generateCalendarDays();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
          <p className="text-gray-600">Schedule and manage your content publication</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as typeof viewMode)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="month">Month View</option>
            <option value="week">Week View</option>
            <option value="list">List View</option>
          </select>
          <Button onClick={() => setShowEventForm(true)} icon={Plus}>
            Schedule Content
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="post">Posts</option>
              <option value="page">Pages</option>
              <option value="event">Events</option>
              <option value="announcement">Announcements</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Event Form Modal */}
      {showEventForm && (
        <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {selectedEvent ? 'Edit Content' : 'Schedule New Content'}
              </h3>

              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Title"
                    value={eventForm.title}
                    onChange={(value) => setEventForm(prev => ({ ...prev, title: value as string }))}
                    placeholder="Enter content title"
                    required
                    type="text"
                  />

                  <FormField
                    label="Content Type"
                    value={eventForm.content_type}
                    onChange={(value) => setEventForm(prev => ({ ...prev, content_type: value as CalendarEvent['content_type'] }))}
                    type="select"
                    options={['post', 'page', 'event', 'announcement']}
                  />
                </div>

                <FormField
                  label="Content"
                  value={eventForm.content}
                  onChange={(value) => setEventForm(prev => ({ ...prev, content: value as string }))}
                  placeholder="Enter content description"
                  type="textarea"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Publish Date & Time"
                    value={eventForm.publish_date}
                    onChange={(value) => setEventForm(prev => ({ ...prev, publish_date: value as string }))}
                    type="text"
                    placeholder="YYYY-MM-DD HH:MM:SS"
                    required
                  />

                  <FormField
                    label="Priority"
                    value={eventForm.priority}
                    onChange={(value) => setEventForm(prev => ({ ...prev, priority: value as CalendarEvent['priority'] }))}
                    type="select"
                    options={['low', 'medium', 'high']}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Tags (comma-separated)"
                    value={eventForm.tags}
                    onChange={(value) => setEventForm(prev => ({ ...prev, tags: value as string }))}
                    placeholder="tag1, tag2, tag3"
                    type="text"
                  />

                  <FormField
                    label="Featured Image URL"
                    value={eventForm.featured_image}
                    onChange={(value) => setEventForm(prev => ({ ...prev, featured_image: value as string }))}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </div>

                <FormField
                  label="Excerpt"
                  value={eventForm.excerpt}
                  onChange={(value) => setEventForm(prev => ({ ...prev, excerpt: value as string }))}
                  placeholder="Brief description for previews"
                  type="textarea"
                />

                <div className="flex space-x-4">
                  <Button type="submit">
                    {selectedEvent ? 'Update Content' : 'Schedule Content'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEventForm(false);
                      setSelectedEvent(null);
                      resetEventForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </Card>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <Card>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">{formatDate(currentDate)}</h3>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={() => navigateMonth('prev')} icon={ChevronLeft}>
                Previous
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCurrentDate(new Date())} className="px-3">
                Today
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigateMonth('next')} icon={ChevronRight}>
                Next
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-50">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 border ${
                  day.isToday ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                } ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}`}
              >
                <div className={`font-semibold mb-2 ${day.isToday ? 'text-blue-600' : ''}`}>
                  {day.date.getDate()}
                </div>

                <div className="space-y-1">
                  {day.events.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getStatusColor(event.status)}`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(event.status)}
                        <span className={`px-1 py-0.5 text-xs rounded ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                      </div>
                    </div>
                  ))}

                  {day.events.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(event.priority)}`}>
                      {event.priority}
                    </span>
                    <span className="text-sm text-gray-600">{event.content_type}</span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {event.excerpt || event.content.substring(0, 150) + '...'}
                  </p>

                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>By {event.author_name}</span>
                    <span>{new Date(event.publish_date).toLocaleDateString()}</span>
                    {event.tags.length > 0 && <span>Tags: {event.tags.join(', ')}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)} icon={Eye}>
                    View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => editEvent(event)} icon={Edit2}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteEvent(event.id)} icon={Trash2}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && !showEventForm && (
        <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedEvent.status)}`}>
                    {selectedEvent.status}
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-700">Author</div>
                    <div>{selectedEvent.author_name}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">Type</div>
                    <div className="capitalize">{selectedEvent.content_type}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">Priority</div>
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(selectedEvent.priority)}`}>
                      {selectedEvent.priority}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">Publish Date</div>
                    <div>{new Date(selectedEvent.publish_date).toLocaleString()}</div>
                  </div>
                </div>

                {selectedEvent.featured_image && (
                  <div>
                    <img
                      src={selectedEvent.featured_image}
                      alt={selectedEvent.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <div className="font-semibold text-gray-700 mb-2">Content</div>
                  <div className="prose max-w-none">{selectedEvent.content}</div>
                </div>

                {selectedEvent.excerpt && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-2">Excerpt</div>
                    <p className="text-gray-600">{selectedEvent.excerpt}</p>
                  </div>
                )}

                {selectedEvent.tags.length > 0 && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  {selectedEvent.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => updateEventStatus(selectedEvent.id, 'scheduled')}
                      icon={Clock}
                    >
                      Schedule
                    </Button>
                  )}
                  {selectedEvent.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => updateEventStatus(selectedEvent.id, 'published')}
                      icon={CheckCircle}
                    >
                      Publish Now
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => editEvent(selectedEvent)} icon={Edit2}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteEvent(selectedEvent.id)} icon={Trash2}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{filteredEvents.length}</div>
          <div className="text-sm text-gray-600">Total Content</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {filteredEvents.filter(e => e.status === 'published').length}
          </div>
          <div className="text-sm text-gray-600">Published</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredEvents.filter(e => e.status === 'scheduled').length}
          </div>
          <div className="text-sm text-gray-600">Scheduled</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {filteredEvents.filter(e => e.status === 'draft').length}
          </div>
          <div className="text-sm text-gray-600">Drafts</div>
        </Card>
      </div>
    </div>
  );
};

export default ContentCalendar;