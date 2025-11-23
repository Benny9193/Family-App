const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get events for a family
router.get('/:familyId', authenticateToken, (req, res) => {
  try {
    const events = db.prepare(`
      SELECT e.*, u.username as created_by_name, u.full_name as created_by_full_name
      FROM events e
      JOIN users u ON e.created_by = u.id
      WHERE e.family_id = ?
      ORDER BY e.start_date ASC
    `).all(req.params.familyId);

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Create event
router.post('/',
  authenticateToken,
  [
    body('familyId').isInt().withMessage('Family ID is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { familyId, title, description, startDate, endDate, allDay, color } = req.body;

    try {
      const result = db.prepare(`
        INSERT INTO events (family_id, title, description, start_date, end_date, all_day, color, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        familyId,
        title,
        description || null,
        startDate,
        endDate || null,
        allDay ? 1 : 0,
        color || '#3B82F6',
        req.user.userId
      );

      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(event);
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
);

// Update event
router.put('/:id', authenticateToken, (req, res) => {
  const { title, description, startDate, endDate, allDay, color } = req.body;

  try {
    db.prepare(`
      UPDATE events
      SET title = ?, description = ?, start_date = ?, end_date = ?, all_day = ?, color = ?
      WHERE id = ?
    `).run(
      title,
      description,
      startDate,
      endDate,
      allDay ? 1 : 0,
      color,
      req.params.id
    );

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
