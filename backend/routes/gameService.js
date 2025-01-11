const express = require('express');
const db = require('../db/database'); 
const router = express.Router(); 

// Create a new Game 
router.post('/new', (req, res) => {
  const { type, user_id, name = 'Tale' } = req.body; 
  
  if (!type || !user_id) {
    return res.status(400).json({ message: 'Type and user_id are required.' });
  }

  const userCheckQuery = 'SELECT id FROM user WHERE id = ?';
  db.get(userCheckQuery, [user_id], (err, row) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (!row) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const insertQuery = 'INSERT INTO game (type, user_id, name) VALUES (?, ?, ?)';
    db.run(insertQuery, [type, user_id, name], function (err) {
      if (err) {
        console.error('Database insertion error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
      }
      res.status(201).json({ message: 'Game created successfully', gameId: this.lastID });
    });
  });
});

module.exports = router;
