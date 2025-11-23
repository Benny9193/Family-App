const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get notes for a family
router.get('/:familyId', authenticateToken, (req, res) => {
  try {
    const notes = db.prepare(`
      SELECT n.*, u.username as created_by_name, u.full_name as created_by_full_name
      FROM notes n
      JOIN users u ON n.created_by = u.id
      WHERE n.family_id = ?
      ORDER BY n.updated_at DESC
    `).all(req.params.familyId);

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

// Create note
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

    const { familyId, title, content } = req.body;

    try {
      const result = db.prepare(`
        INSERT INTO notes (family_id, title, content, created_by)
        VALUES (?, ?, ?, ?)
      `).run(familyId, title, content || '', req.user.userId);

      const note = db.prepare(`
        SELECT n.*, u.username as created_by_name
        FROM notes n
        JOIN users u ON n.created_by = u.id
        WHERE n.id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json(note);
    } catch (error) {
      console.error('Create note error:', error);
      res.status(500).json({ error: 'Failed to create note' });
    }
  }
);

// Update note
router.put('/:id', authenticateToken, (req, res) => {
  const { title, content } = req.body;

  try {
    db.prepare(`
      UPDATE notes
      SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, req.params.id);

    const note = db.prepare(`
      SELECT n.*, u.username as created_by_name
      FROM notes n
      JOIN users u ON n.created_by = u.id
      WHERE n.id = ?
    `).get(req.params.id);

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
