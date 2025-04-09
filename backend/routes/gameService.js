// const { sessionMiddleware } = require('../server.js'); 
const express = require('express');
const db = require('../db/database'); 
const router = express.Router(); 
const { convertSvgToPngAndUpload } = require('./convertSvgToPng');

// Create a new Game 

router.get('/top_10_most_liked_games', async (req, res) => {
  try {
    const query = `
      SELECT * 
      FROM game 
      WHERE privacy = 0 AND suspend = 0
      ORDER BY likes DESC 
      LIMIT 10
    `;

    db.all(query, (err, games) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      
      res.json(games || []); 
    });
  } catch (error) {
    console.error('Error fetching top 10 games:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/game_details/:gameId', async (req, res) => {
  const gameId = req.params.gameId; 

  try {
    const query = `
      SELECT * 
      FROM game 
      WHERE id = ?
    `;

    db.get(query, [gameId], (err, game) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }

      res.json(game)
    });
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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

    // Generate a random game code with a hashtag (#) before it
    const gameCode = `#${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const insertQuery = 'INSERT INTO game (type, user_id, name, game_code) VALUES (?, ?, ?, ?)';
    db.run(insertQuery, [type, user_id, name, gameCode], function (err) {
      if (err) {
        console.error('Database insertion error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
      }
      res.status(201).json({ message: 'Game created successfully', gameId: this.lastID, gameCode });
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
