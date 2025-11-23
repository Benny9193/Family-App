import { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { calendarService } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

const Calendar = () => {
  const { currentFamily } = useFamily();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    color: '#3B82F6',
  });

  useEffect(() => {
    if (currentFamily) {
      loadEvents();
    }
  }, [currentFamily]);

  const loadEvents = async () => {
    try {
      const data = await calendarService.getEvents(currentFamily.id);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await calendarService.updateEvent(editingEvent.id, formData);
      } else {
        await calendarService.createEvent({ ...formData, familyId: currentFamily.id });
      }
      loadEvents();
      resetForm();
    } catch (error) {
      alert('Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await calendarService.deleteEvent(id);
        loadEvents();
      } catch (error) {
        alert('Failed to delete event');
      }
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startDate: event.start_date.slice(0, 16),
      endDate: event.end_date ? event.end_date.slice(0, 16) : '',
      allDay: event.all_day === 1,
      color: event.color,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      allDay: false,
      color: '#3B82F6',
    });
    setEditingEvent(null);
    setShowModal(false);
  };

  const upcomingEvents = events
    .filter(e => new Date(e.start_date) >= new Date())
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  const pastEvents = events
    .filter(e => new Date(e.start_date) < new Date())
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <FiPlus className="inline mr-2" />
          Add Event
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div key={event.id} className="card flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-16 rounded" style={{ backgroundColor: event.color }}></div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                      {event.description && <p className="text-gray-600 text-sm mt-1">{event.description}</p>}
                      <p className="text-sm text-gray-500 mt-2">
                        {format(new Date(event.start_date), 'PPp')}
                        {event.end_date && ` - ${format(new Date(event.end_date), 'PPp')}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">by {event.created_by_full_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(event)} className="text-blue-600 hover:text-blue-700 p-2">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-700 p-2">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Events</h2>
            <div className="space-y-3">
              {pastEvents.slice(0, 5).map(event => (
                <div key={event.id} className="card opacity-60 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-16 rounded" style={{ backgroundColor: event.color }}></div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        {format(new Date(event.start_date), 'PPp')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingEvent ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <FiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={formData.allDay}
                  onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="allDay" className="text-sm font-medium text-gray-700">All day event</label>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingEvent ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
