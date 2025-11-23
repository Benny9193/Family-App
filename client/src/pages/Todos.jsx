import { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { todoService, familyService } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';

const Todos = () => {
  const { currentFamily } = useFamily();
  const [todos, setTodos] = useState([]);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
  });

  useEffect(() => {
    if (currentFamily) {
      loadTodos();
      loadMembers();
    }
  }, [currentFamily]);

  const loadTodos = async () => {
    try {
      const data = await todoService.getTodos(currentFamily.id);
      setTodos(data);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await familyService.getMembers(currentFamily.id);
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const todoData = {
        ...formData,
        assignedTo: formData.assignedTo || null,
      };

      if (editingTodo) {
        await todoService.updateTodo(editingTodo.id, { ...todoData, completed: editingTodo.completed });
      } else {
        await todoService.createTodo({ ...todoData, familyId: currentFamily.id });
      }
      loadTodos();
      resetForm();
    } catch (error) {
      alert('Failed to save todo');
    }
  };

  const handleToggle = async (id) => {
    try {
      await todoService.toggleTodo(id);
      loadTodos();
    } catch (error) {
      alert('Failed to update todo');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      try {
        await todoService.deleteTodo(id);
        loadTodos();
      } catch (error) {
        alert('Failed to delete todo');
      }
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      assignedTo: todo.assigned_to || '',
      dueDate: todo.due_date ? todo.due_date.slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: '',
      dueDate: '',
    });
    setEditingTodo(null);
    setShowModal(false);
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  const priorityColors = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-green-600 bg-green-50 border-green-200',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Todos</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <FiPlus className="inline mr-2" />
          Add Todo
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active ({activeTodos.length})</h2>
          {activeTodos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active todos</p>
          ) : (
            <div className="space-y-3">
              {activeTodos.map(todo => (
                <div key={todo.id} className="card flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => handleToggle(todo.id)}
                      className="mt-1 w-5 h-5 border-2 border-gray-300 rounded hover:border-primary-500 flex items-center justify-center"
                    >
                      {todo.completed && <FiCheck className="text-primary-600" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">{todo.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded border ${priorityColors[todo.priority]}`}>
                          {todo.priority}
                        </span>
                      </div>
                      {todo.description && <p className="text-gray-600 text-sm mt-1">{todo.description}</p>}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        {todo.assigned_to_full_name && (
                          <span>Assigned to: {todo.assigned_to_full_name}</span>
                        )}
                        {todo.due_date && (
                          <span>Due: {format(new Date(todo.due_date), 'PPp')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(todo)} className="text-blue-600 hover:text-blue-700 p-2">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete(todo.id)} className="text-red-600 hover:text-red-700 p-2">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {completedTodos.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed ({completedTodos.length})</h2>
            <div className="space-y-3">
              {completedTodos.map(todo => (
                <div key={todo.id} className="card opacity-60 flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => handleToggle(todo.id)}
                      className="mt-1 w-5 h-5 border-2 border-primary-500 rounded flex items-center justify-center bg-primary-500"
                    >
                      <FiCheck className="text-white" />
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 line-through">{todo.title}</h3>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(todo.id)} className="text-red-600 hover:text-red-700 p-2">
                    <FiTrash2 />
                  </button>
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
              <h2 className="text-2xl font-bold">{editingTodo ? 'Edit Todo' : 'New Todo'}</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="input-field"
                >
                  <option value="">Unassigned</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingTodo ? 'Update' : 'Create'}
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

export default Todos;
