const express = require('express');
const { uploadAvatar, uploadAttachment } = require('../config/upload');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/db');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Upload avatar
router.post('/avatar', authenticateToken, uploadAvatar.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Get old avatar to delete if exists
    const user = db.prepare('SELECT avatar_url FROM users WHERE id = ?').get(req.user.userId);

    // Update user's avatar URL
    db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?')
      .run(avatarUrl, req.user.userId);

    // Delete old avatar file if it exists
    if (user.avatar_url) {
      const oldPath = path.join(__dirname, '..', user.avatar_url);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Upload note attachment
router.post('/attachment/:noteId', authenticateToken, uploadAttachment.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const noteId = req.params.noteId;

    // Verify note exists and user has access
    const note = db.prepare(`
      SELECT n.* FROM notes n
      JOIN family_members fm ON n.family_id = fm.family_id
      WHERE n.id = ? AND fm.user_id = ?
    `).get(noteId, req.user.userId);

    if (!note) {
      // Delete uploaded file if note doesn't exist or no access
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Note not found or no access' });
    }

    const filePath = `/uploads/attachments/${req.file.filename}`;

    // Save attachment info to database
    const result = db.prepare(`
      INSERT INTO note_attachments (note_id, filename, original_name, file_path, file_size, mime_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      noteId,
      req.file.filename,
      req.file.originalname,
      filePath,
      req.file.size,
      req.file.mimetype
    );

    const attachment = db.prepare('SELECT * FROM note_attachments WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json(attachment);
  } catch (error) {
    console.error('Attachment upload error:', error);
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
});

// Get note attachments
router.get('/attachments/:noteId', authenticateToken, (req, res) => {
  try {
    const noteId = req.params.noteId;

    // Verify access
    const note = db.prepare(`
      SELECT n.* FROM notes n
      JOIN family_members fm ON n.family_id = fm.family_id
      WHERE n.id = ? AND fm.user_id = ?
    `).get(noteId, req.user.userId);

    if (!note) {
      return res.status(404).json({ error: 'Note not found or no access' });
    }

    const attachments = db.prepare('SELECT * FROM note_attachments WHERE note_id = ?')
      .all(noteId);

    res.json(attachments);
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({ error: 'Failed to get attachments' });
  }
});

// Delete attachment
router.delete('/attachment/:id', authenticateToken, (req, res) => {
  try {
    const attachmentId = req.params.id;

    // Get attachment with access check
    const attachment = db.prepare(`
      SELECT na.* FROM note_attachments na
      JOIN notes n ON na.note_id = n.id
      JOIN family_members fm ON n.family_id = fm.family_id
      WHERE na.id = ? AND fm.user_id = ?
    `).get(attachmentId, req.user.userId);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found or no access' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', attachment.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.prepare('DELETE FROM note_attachments WHERE id = ?').run(attachmentId);

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

module.exports = router;
