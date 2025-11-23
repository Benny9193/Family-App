import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  register: async (username, email, password, fullName) => {
    const response = await api.post('/auth/register', { username, email, password, fullName });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Family service
export const familyService = {
  getFamilies: async () => {
    const response = await api.get('/family');
    return response.data;
  },

  createFamily: async (name) => {
    const response = await api.post('/family', { name });
    return response.data;
  },

  joinFamily: async (inviteCode) => {
    const response = await api.post('/family/join', { inviteCode });
    return response.data;
  },

  getMembers: async (familyId) => {
    const response = await api.get(`/family/${familyId}/members`);
    return response.data;
  },
};

// Calendar service
export const calendarService = {
  getEvents: async (familyId) => {
    const response = await api.get(`/calendar/${familyId}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/calendar', eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await api.put(`/calendar/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/calendar/${id}`);
    return response.data;
  },
};

// Todo service
export const todoService = {
  getTodos: async (familyId) => {
    const response = await api.get(`/todos/${familyId}`);
    return response.data;
  },

  createTodo: async (todoData) => {
    const response = await api.post('/todos', todoData);
    return response.data;
  },

  updateTodo: async (id, todoData) => {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },

  toggleTodo: async (id) => {
    const response = await api.patch(`/todos/${id}/toggle`);
    return response.data;
  },

  deleteTodo: async (id) => {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },
};

// Note service
export const noteService = {
  getNotes: async (familyId) => {
    const response = await api.get(`/notes/${familyId}`);
    return response.data;
  },

  createNote: async (noteData) => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },

  updateNote: async (id, noteData) => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },

  deleteNote: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};

export default api;
