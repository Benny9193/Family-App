const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's families
router.get('/', authenticateToken, (req, res) => {
  try {
    const families = db.prepare(`
      SELECT f.*, fm.role,
        (SELECT COUNT(*) FROM family_members WHERE family_id = f.id) as member_count
      FROM families f
      JOIN family_members fm ON f.id = fm.family_id
      WHERE fm.user_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user.userId);

    res.json(families);
  } catch (error) {
    console.error('Get families error:', error);
    res.status(500).json({ error: 'Failed to get families' });
  }
});

// Create family
router.post('/',
  authenticateToken,
  [body('name').trim().notEmpty().withMessage('Family name is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    try {
      db.transaction(() => {
        const result = db.prepare(
          'INSERT INTO families (name, invite_code, created_by) VALUES (?, ?, ?)'
        ).run(name, inviteCode, req.user.userId);

        db.prepare(
          'INSERT INTO family_members (family_id, user_id, role) VALUES (?, ?, ?)'
        ).run(result.lastInsertRowid, req.user.userId, 'admin');

        const family = db.prepare('SELECT * FROM families WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(family);
      })();
    } catch (error) {
      console.error('Create family error:', error);
      res.status(500).json({ error: 'Failed to create family' });
    }
  }
);

// Join family with invite code
router.post('/join',
  authenticateToken,
  [body('inviteCode').trim().notEmpty().withMessage('Invite code is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { inviteCode } = req.body;

    try {
      const family = db.prepare('SELECT * FROM families WHERE invite_code = ?').get(inviteCode.toUpperCase());

      if (!family) {
        return res.status(404).json({ error: 'Invalid invite code' });
      }

      const existingMember = db.prepare(
        'SELECT * FROM family_members WHERE family_id = ? AND user_id = ?'
      ).get(family.id, req.user.userId);

      if (existingMember) {
        return res.status(400).json({ error: 'You are already a member of this family' });
      }

      db.prepare(
        'INSERT INTO family_members (family_id, user_id) VALUES (?, ?)'
      ).run(family.id, req.user.userId);

      res.json({ message: 'Successfully joined family', family });
    } catch (error) {
      console.error('Join family error:', error);
      res.status(500).json({ error: 'Failed to join family' });
    }
  }
);

// Get family members
router.get('/:familyId/members', authenticateToken, (req, res) => {
  try {
    const members = db.prepare(`
      SELECT u.id, u.username, u.full_name, u.avatar_color, fm.role, fm.joined_at
      FROM users u
      JOIN family_members fm ON u.id = fm.user_id
      WHERE fm.family_id = ?
      ORDER BY fm.joined_at ASC
    `).all(req.params.familyId);

    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get family members' });
  }
});

module.exports = router;
