import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Calendar as CalendarIcon, 
  User as UserIcon, 
  MoreVertical,
  Trash2,
  Edit2,
  Sparkles,
  Search,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { db } from '../services/db';
import { Event, UserRole, User } from '../types';
import { generateEventDescription } from '../services/geminiService';

interface EventsProps {
  user: User;
}

const Events: React.FC<EventsProps> = ({ user }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Form State
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    category: 'Academic',
    date: '',
    location: '',
    capacity: 100,
    description: '',
    status: 'Upcoming'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    setEvents(db.getEvents());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateAI = async () => {
    if (!formData.title || !formData.category) return;
    setIsGenerating(true);
    const desc = await generateEventDescription(formData.title!, formData.category!);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allEvents = db.getEvents();
    
    if (editingEvent) {
      // Update
      const updatedEvents = allEvents.map(ev => 
        ev.id === editingEvent.id ? { ...ev, ...formData } as Event : ev
      );
      db.saveEvents(updatedEvents);
    } else {
      // Create
      const newEvent: Event = {
        ...formData as Event,
        id: Date.now().toString(),
        createdBy: user.id,
        registeredCount: 0,
        organizer: user.name,
        imageUrl: `https://picsum.photos/seed/${Date.now()}/800/400`
      };
      db.saveEvents([...allEvents, newEvent]);
    }
    
    closeModal();
    loadEvents();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const filtered = events.filter(e => e.id !== id);
      db.saveEvents(filtered);
      loadEvents();
    }
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData(event);
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        category: 'Academic',
        date: '',
        location: '',
        capacity: 100,
        description: '',
        status: 'Upcoming'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const canManage = user.role === UserRole.ADMIN || user.role === UserRole.TEACHER;

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
        {canManage && (
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Event
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="All">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Workshop">Workshop</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700">
                {event.category}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{event.title}</h3>
                {canManage && (
                  <div className="flex gap-1">
                    <button onClick={() => openModal(event)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button>
                    {user.role === UserRole.ADMIN && (
                      <button onClick={() => handleDelete(event.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500 mt-auto">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  {event.registeredCount} / {event.capacity} registered
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                  ${event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 
                    event.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                  {event.status}
                </span>
                {user.role === UserRole.STUDENT && event.status === 'Upcoming' && (
                  <button 
                    disabled={event.registeredCount >= event.capacity}
                    className="text-primary-600 text-sm font-semibold hover:text-primary-800 disabled:opacity-50"
                  >
                    {event.registeredCount >= event.capacity ? 'Full' : 'Register Now →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500"><X className="h-6 w-6" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event Title</label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                         <option value="Academic">Academic</option>
                         <option value="Sports">Sports</option>
                         <option value="Cultural">Cultural</option>
                         <option value="Workshop">Workshop</option>
                         <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <button 
                        type="button" 
                        onClick={handleGenerateAI}
                        disabled={isGenerating || !formData.title}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <Sparkles className="h-3 w-3 mr-1" />}
                        Generate with AI
                      </button>
                    </div>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-gray-700">Capacity</label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                    >
                      {editingEvent ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;