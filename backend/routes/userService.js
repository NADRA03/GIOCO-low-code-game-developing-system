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

router.get('/games/:userId', (req, res) => {
  const userId = req.params.userId;

  const userCheckQuery = 'SELECT id FROM user WHERE id = ?';
  db.get(userCheckQuery, [userId], (err, row) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (!row) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const getGamesQuery = `
      SELECT 
        id AS game_id,
        user_id,
        name AS game_name,
        image,
        source_code_url,
        likes,
        plays,
        description,
        type
      FROM game
      WHERE user_id = ?
    `;
    db.all(getGamesQuery, [userId], (err, rows) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: 'No games found for the user.' });
      }

      res.status(200).json({ games: rows });
    });
  });
});

router.post('/add_asset', (req, res) => {
  const { name, user_id, image, sound, game_id } = req.body;

  // Check if the user exists
  const userCheckQuery = 'SELECT id FROM user WHERE id = ?';
  db.get(userCheckQuery, [user_id], (err, userRow) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (!userRow) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the game exists
    const gameCheckQuery = 'SELECT id FROM game WHERE id = ?';
    db.get(gameCheckQuery, [game_id], (err, gameRow) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      if (!gameRow) {
        return res.status(404).json({ message: 'Game not found.' });
      }

      // Insert the new asset
      const insertAssetQuery = `
        INSERT INTO asset (private, name, user_id, image, sound, game_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.run(insertAssetQuery, [true, name, user_id, image || null, sound || null, game_id], function (err) {
        if (err) {
          console.error('Database insert error:', err);
          return res.status(500).json({ message: 'Internal server error.' });
        }

        // Respond with the ID of the newly created asset
        res.status(201).json({ 
          message: 'Asset added successfully.', 
          asset_id: this.lastID 
        });
      });
    });
  });
});

router.get('/get_last_10_assets_for_user/:user_id', (req, res) => {
  console.log("Fetching last 10 assets for user.");
  const { user_id } = req.params;

  const query = `
    SELECT * 
    FROM asset
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 10
  `;

  db.all(query, [user_id], (err, rows) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    // Return an empty array if no assets are found, no need for 404
    res.status(200).json({
      message: 'Assets retrieved successfully.',
      assets: rows || [],  // Will return an empty array if no assets found
    });
  });
});

router.post('/check_user_collected_asset', (req, res) => {
  console.log("here");
  const { user_id, asset_url, game_id } = req.body; // Use `asset_url` for clarity

  const query = `
    SELECT COUNT(*) AS count
    FROM asset
    WHERE (image = ? OR sound = ?) AND user_id = ? AND game_id = ?
  `;

  db.get(query, [asset_url, asset_url, user_id, game_id], (err, row) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    const hasCollected = row.count > 0;

    res.status(200).json({
      message: hasCollected
        ? 'User has collected this asset in the game.'
        : 'User has not collected this asset in the game.',
      collected: hasCollected,
    });
  });
});


module.exports = router;