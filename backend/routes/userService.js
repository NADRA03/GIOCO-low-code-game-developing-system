const express = require('express');
const db = require('../db/database'); 
const router = express.Router(); 


router.get('/plays/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = 'SELECT SUM(plays) AS totalPlays FROM game WHERE user_id = ?';
  
  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    const plays = row?.totalPlays || 0; 
    res.json({ plays });
  });
});

module.exports = router;