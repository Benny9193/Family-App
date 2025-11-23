import { useState, useEffect, useRef } from 'react';
import { useFamily } from '../context/FamilyContext';
import { noteService, uploadService } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiPaperclip, FiFile, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';

const Notes = () => {
  const { currentFamily } = useFamily();
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [attachments, setAttachments] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
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
      // Load attachments for all notes
      const attachmentPromises = data.map(note =>
        uploadService.getAttachments(note.id)
          .then(atts => ({ noteId: note.id, attachments: atts }))
          .catch(() => ({ noteId: note.id, attachments: [] }))
      );
      const attachmentResults = await Promise.all(attachmentPromises);
      const attachmentMap = {};
      attachmentResults.forEach(({ noteId, attachments: atts }) => {
        attachmentMap[noteId] = atts;
      });
      setAttachments(attachmentMap);
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
        const newNote = await noteService.createNote({ ...formData, familyId: currentFamily.id });
        // If there's a file selected, upload it
        if (fileInputRef.current?.files[0] && newNote.id) {
          await handleFileUpload(newNote.id, fileInputRef.current.files[0]);
        }
      }
      loadNotes();
      resetForm();
    } catch (error) {
      alert('Failed to save note');
    }
  };

  const handleFileUpload = async (noteId, file) => {
    setUploading(true);
    try {
      await uploadService.uploadAttachment(noteId, file);
      loadNotes();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId, noteId) => {
    if (confirm('Are you sure you want to delete this attachment?')) {
      try {
        await uploadService.deleteAttachment(attachmentId);
        loadNotes();
      } catch (error) {
        alert('Failed to delete attachment');
      }
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

              {/* Attachments */}
              {attachments[note.id]?.length > 0 && (
                <div className="mb-3 space-y-1">
                  {attachments[note.id].map(att => (
                    <div key={att.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FiFile className="flex-shrink-0" />
                        <a
                          href={`${window.location.origin}${att.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {att.original_name}
                        </a>
                      </div>
                      <button
                        onClick={() => handleDeleteAttachment(att.id, note.id)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-400 pt-3 border-t border-gray-100">
                <p>by {note.created_by_full_name}</p>
                <p>Updated {format(new Date(note.updated_at), 'PPp')}</p>
              </div>

              {/* Upload button for existing notes */}
              {!editingNote && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <label className="cursor-pointer text-xs text-primary-600 hover:text-primary-700 flex items-center">
                    <FiPaperclip className="mr-1" />
                    Attach File
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload(note.id, e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
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

              {!editingNote && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attach File (Optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button type="submit" disabled={uploading} className="btn-primary flex-1 disabled:opacity-50">
                  {uploading ? 'Uploading...' : editingNote ? 'Update' : 'Create'}
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
