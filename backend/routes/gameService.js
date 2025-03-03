const express = require('express');
const db = require('../db/database'); 
const router = express.Router(); 
const { convertSvgToPngAndUpload } = require('./convertSvgToPng');

// Create a new Game 

router.post('/convert-svg-to-png', async (req, res) => {
  const { svg, fileName } = req.body;

  try {
    const downloadURL = await convertSvgToPngAndUpload(svg, fileName);
    res.json({ url: downloadURL }); 
  } catch (error) {
    res.status(500).json({ error: 'Failed to convert and upload image' });
  }
});

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

router.get('/get_assets_for_game/:game_id', (req, res) => {
  const { game_id } = req.params;

  const query = `
    SELECT * 
    FROM asset
    WHERE game_id = ?
  `;

  db.all(query, [game_id], (err, rows) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No assets found for this game.' });
    }

    res.status(200).json({
      message: 'Assets retrieved successfully.',
      assets: rows,
    });
  });
});

router.delete('/delete_asset/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM asset
    WHERE id = ?
  `;

  db.run(query, [id], function (err) {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'No asset found with the specified ID.' });
    }

    res.status(200).json({
      message: 'Asset deleted successfully.',
    });
  });
});

module.exports = router;
