const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get todos for a family
router.get('/:familyId', authenticateToken, (req, res) => {
  try {
    const todos = db.prepare(`
      SELECT t.*,
        u1.username as created_by_name,
        u2.username as assigned_to_name,
        u2.full_name as assigned_to_full_name
      FROM todos t
      JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.family_id = ?
      ORDER BY t.completed ASC, t.due_date ASC, t.created_at DESC
    `).all(req.params.familyId);

    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to get todos' });
  }
});

// Create todo
router.post('/',
  authenticateToken,
  [
    body('familyId').isInt().withMessage('Family ID is required'),
    body('title').trim().notEmpty().withMessage('Title is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { familyId, title, description, priority, assignedTo, dueDate } = req.body;

    try {
      const result = db.prepare(`
        INSERT INTO todos (family_id, title, description, priority, assigned_to, due_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        familyId,
        title,
        description || null,
        priority || 'medium',
        assignedTo || null,
        dueDate || null,
        req.user.userId
      );

      const todo = db.prepare(`
        SELECT t.*,
          u1.username as created_by_name,
          u2.username as assigned_to_name
        FROM todos t
        JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        WHERE t.id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json(todo);
    } catch (error) {
      console.error('Create todo error:', error);
      res.status(500).json({ error: 'Failed to create todo' });
    }
  }
);

// Update todo
router.put('/:id', authenticateToken, (req, res) => {
  const { title, description, completed, priority, assignedTo, dueDate } = req.body;

  try {
    db.prepare(`
      UPDATE todos
      SET title = ?, description = ?, completed = ?, priority = ?, assigned_to = ?, due_date = ?
      WHERE id = ?
    `).run(
      title,
      description,
      completed ? 1 : 0,
      priority,
      assignedTo,
      dueDate,
      req.params.id
    );

    const todo = db.prepare(`
      SELECT t.*,
        u1.username as created_by_name,
        u2.username as assigned_to_name
      FROM todos t
      JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?
    `).get(req.params.id);

    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Toggle todo completion
router.patch('/:id/toggle', authenticateToken, (req, res) => {
  try {
    const todo = db.prepare('SELECT completed FROM todos WHERE id = ?').get(req.params.id);
    const newCompleted = todo.completed ? 0 : 1;

    db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(newCompleted, req.params.id);

    const updated = db.prepare(`
      SELECT t.*,
        u1.username as created_by_name,
        u2.username as assigned_to_name
      FROM todos t
      JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
});

// Delete todo
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = router;
