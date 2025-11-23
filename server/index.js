require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/db');

const authRoutes = require('./routes/auth');
const calendarRoutes = require('./routes/calendar');
const todosRoutes = require('./routes/todos');
const notesRoutes = require('./routes/notes');
const familyRoutes = require('./routes/family');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/family', familyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Family App API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
