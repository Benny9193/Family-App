import { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { noteService } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

const Notes = () => {
  const { currentFamily } = useFamily();
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    if (currentFamily) {
      loadNotes();
    }
  }, [currentFamily]);

  const loadNotes = async () => {
    try {
      const data = await noteService.getNotes(currentFamily.id);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await noteService.updateNote(editingNote.id, formData);
      } else {
        await noteService.createNote({ ...formData, familyId: currentFamily.id });
      }
      loadNotes();
      resetForm();
    } catch (error) {
      alert('Failed to save note');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await noteService.deleteNote(id);
        loadNotes();
      } catch (error) {
        alert('Failed to delete note');
      }
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
    });
    setEditingNote(null);
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Family Notes</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <FiPlus className="inline mr-2" />
          Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No notes yet. Create your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <div key={note.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-900 flex-1">{note.title}</h3>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(note)} className="text-blue-600 hover:text-blue-700 p-1">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="text-red-600 hover:text-red-700 p-1">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm whitespace-pre-wrap mb-3 line-clamp-6">{note.content}</p>
              <div className="text-xs text-gray-400 pt-3 border-t border-gray-100">
                <p>by {note.created_by_full_name}</p>
                <p>Updated {format(new Date(note.updated_at), 'PPp')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingNote ? 'Edit Note' : 'New Note'}</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-field"
                  rows="10"
                  placeholder="Write your note here..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingNote ? 'Update' : 'Create'}
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

export default Notes;
