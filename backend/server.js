const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); 
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const cors = require('cors');
const app = express();
const argon2 = require('argon2');

//Services
const userService = require('./routes/userService'); 
const gameService = require('./routes/gameService'); // Importing profile routes
app.use(cors({
  // origin: 'http://172.20.10.1:8081',                ///////////here//////////////
  origin: 'http://192.168.0.104:8081',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'TapTale.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

app.use(
  session({
    secret: 'your_secret_key', 
    resave: false,
    saveUninitialized: true,
    cookie: {   secure: false, 
      maxAge: 30 * 24 * 60 * 60 * 1000  }, 
      store: new SQLiteStore({
        db: 'sessions.db',
      }),
  })
);

const passwordValidator = (password) => {
  const minLength = 8;
  const uppercase = /[A-Z]/;
  const lowercase = /[a-z]/;
  const number = /[0-9]/;
  const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

  if (
    password.length < minLength ||
    !uppercase.test(password) ||
    !lowercase.test(password) ||
    !number.test(password) ||
    !specialChar.test(password)
  ) {
    return false;
  }
  return true;
};

app.post('/edit_game', sessionMiddleware, async (req, res) => {
  const { gameId, privacy, serve, suspend, image, name, description } = req.body;
  const userId = req.user.id; // Get user ID from session

  // Check if gameId is provided
  if (!gameId) {
    return res.status(400).json({ message: 'Game ID is required.' });
  }

  // Construct the query dynamically based on which fields are provided
  const updateFields = [];
  const updateValues = [];

  // Ensure that the user is authorized to edit this game
  const gameCheckQuery = 'SELECT user_id FROM game WHERE id = ?';
  db.get(gameCheckQuery, [gameId], (err, row) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (!row || row.user_id !== userId) {
      return res.status(403).json({ message: 'You are not authorized to edit this game.' });
    }

    // Add the fields to update if they exist in the request body
    if (privacy !== undefined) {
      updateFields.push('privacy = ?');
      updateValues.push(privacy);
    }
    if (serve !== undefined) {
      updateFields.push('serve = ?');
      updateValues.push(serve);
    }
    if (suspend !== undefined) {
      updateFields.push('suspend = ?');
      updateValues.push(suspend);
    }
    if (image) {
      updateFields.push('image = ?');
      updateValues.push(image);
    }
    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    // If no fields to update, return an error
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    // Combine the update fields into a single SQL query
    const updateQuery = `
      UPDATE game
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    updateValues.push(gameId); // Add the gameId at the end

    // Execute the update query
    db.run(updateQuery, updateValues, function (err) {
      if (err) {
        console.error('Database update error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      res.json({ message: 'Game updated successfully.' });
    });
  });
});

app.post('/join_game', sessionMiddleware, async (req, res) => {
  const userId = req.user.id; 
  const { gameId } = req.body; 

  if (!gameId) {
    return res.status(400).json({ message: 'Game ID is required' });
  }

  try {
    // Check if the user already joined this game
    const checkQuery = `
      SELECT id FROM server WHERE game_id = ? AND user_id = ?
    `;

    db.get(checkQuery, [gameId, userId], (err, existingEntry) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (existingEntry) {
        return res.json({ message: 'Already joined the game' }); 
      }

      // Insert new entry if not already joined
      const insertQuery = `
        INSERT INTO server (game_id, user_id)
        VALUES (?, ?)
      `;

      db.run(insertQuery, [gameId, userId], function (err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Successfully joined the game', serverId: this.lastID });
      });
    });
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/get_games_by_session', sessionMiddleware, async (req, res) => {
  const userId = req.user.id; 

  try {
    const query = `
      SELECT game.*
      FROM server
      INNER JOIN game ON server.game_id = game.id
      WHERE server.user_id = ?
    `;

    db.all(query, [userId], (err, games) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.json(games || []); 
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/edit-email', sessionMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { newEmail } = req.body;

  if (!newEmail) {
    return res.status(400).json({ message: 'New email is required.' });
  }

  try {
    // Check if the email is already in use
    const checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
    db.get(checkEmailQuery, [newEmail], (err, existingUser) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      if (existingUser) {
        return res.status(409).json({ message: 'Email is already in use.' });
      }

      // Update the email in the database
      const updateEmailQuery = 'UPDATE user SET email = ? WHERE id = ?';
      db.run(updateEmailQuery, [newEmail, userId], function (err) {
        if (err) {
          console.error('Error updating email:', err);
          return res.status(500).json({ message: 'Internal server error.' });
        }

        res.status(200).json({ message: 'Email updated successfully!' });
      });
    });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Function to edit password
app.post('/edit-password', sessionMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old and new passwords are required.' });
  }

  // Validate new password strength
  if (!passwordValidator(newPassword)) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  try {
    // Get the user's current password hash from the database
    const getUserQuery = 'SELECT password FROM user WHERE id = ?';
    db.get(getUserQuery, [userId], async (err, user) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Verify the old password
      const validPassword = await argon2.verify(user.password, oldPassword);
      if (!validPassword) {
        return res.status(401).json({ message: 'Incorrect old password.' });
      }

      // Hash the new password
      const hashedPassword = await argon2.hash(newPassword);

      // Update the password in the database
      const updatePasswordQuery = 'UPDATE user SET password = ? WHERE id = ?';
      db.run(updatePasswordQuery, [hashedPassword, userId], function (err) {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ message: 'Internal server error.' });
        }

        res.status(200).json({ message: 'Password updated successfully!' });
      });
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/signup', async (req, res) => {
  const { email, username, password, google_id, dateOfBirth } = req.body;

  // Check if all required fields are provided
  if (!email || !username || !password || !dateOfBirth) {
    return res.status(400).json({ message: 'Email, username, password, and date of birth are required.' });
  }

  // Validate password strength
  if (!passwordValidator(password)) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  try {
    // Check if email or username already exists
    const checkQuery = 'SELECT * FROM user WHERE email = ? OR username = ?';
    db.get(checkQuery, [email, username], async (err, existingUser) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(409).json({ message: 'Email is already in use.' });
        }
        if (existingUser.username === username) {
          return res.status(409).json({ message: 'Username is already taken.' });
        }
      }

      // Hash the password with Argon2
      const hashedPassword = await argon2.hash(password);

      // Insert new user into the database, including date of birth and google_id if provided
      const insertQuery =
        'INSERT INTO user (email, username, password, google_id, date_of_birth, wins) VALUES (?, ?, ?, ?, ?, ?)';
      db.run(insertQuery, [email, username, hashedPassword, google_id || null, dateOfBirth, 0], function (err) {
        if (err) {
          console.error('Error inserting user into database:', err);
          return res.status(500).json({ message: 'Internal server error.' });
        }
        // Set the session for the new user
        req.session.user = {
          id: this.lastID,
          email,
          username,
          google_id,
          dateOfBirth,
        };

        // Save the session and respond
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session:', err);
            return res.status(500).json({ message: 'Failed to save session.' });
          }

          res.status(201).json({ message: 'Signup successful!', user: req.session.user });
        });
      });
    });
  } catch (error) {
    console.error('Error during signup process:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.put('/edit_user_profile', sessionMiddleware, (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  const allowedFields = ['username', 'profile_image', 'bio'];
  const fieldsToUpdate = Object.keys(updates).filter(field => allowedFields.includes(field));

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ message: 'No valid fields provided for update.' });
  }

  // If username is being updated, check if it's already taken
  if (updates.username) {
    const checkUsernameQuery = `SELECT id FROM user WHERE username = ? AND id != ?`;

    db.get(checkUsernameQuery, [updates.username, userId], (err, row) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      if (row) {
        return res.status(400).json({ message: 'Username is already in use.' });
      }

      // Proceed with the update if the username is not taken
      updateUserProfile(userId, updates, res);
    });
  } else {
    // No username update, proceed with other updates
    updateUserProfile(userId, updates, res);
  }
});

function updateUserProfile(userId, updates, res) {
  const fieldsToUpdate = Object.keys(updates);
  const values = fieldsToUpdate.map(field => updates[field]);

  const query = `
    UPDATE user
    SET ${fieldsToUpdate.map(field => `${field} = ?`).join(', ')}
    WHERE id = ?
  `;

  db.run(query, [...values, userId], function(err) {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User data updated successfully.' });
  });
}


app.get('/all_user_data', sessionMiddleware, (req, res) => {
  const userId = req.user.id; 

  const query = `
    SELECT id, username, email, profile_image, date_of_birth, bio
    FROM user
    WHERE id = ?
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (!row) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(row);
  });
});

app.get('/a_user_data/:userId', (req, res) => {
  const userId = req.params.userId; // Get userId from URL parameter

  const query = `
    SELECT id, username, email, profile_image, date_of_birth, bio
    FROM user
    WHERE id = ?
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (!row) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(row);
  });
});


app.get('/all_users_data', (req, res) => {
  const searchKeyword = req.query.search || ''; 
  const query = `
    SELECT id, username, email, profile_image, date_of_birth, bio
    FROM user
    WHERE username LIKE ?
  `;

  const searchValue = `%${searchKeyword}%`; // Enables partial matching

  db.all(query, [searchValue], (err, rows) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    res.status(200).json(rows);
  });
});

app.post('/login', async (req, res) => {
  console.log('Login attempt received');
  console.log('Request body:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const query = 'SELECT * FROM user WHERE username = ?';
  db.get(query, [username], async (err, user) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    console.log('User found in database:', user);
    if (!user) {
      return res.status(401).json({ message: 'Invalid password or username.' });
    }

    try {
      const isPasswordValid = await argon2.verify(user.password, password);
      if (isPasswordValid) {
        // Set the new session after verifying the password
        req.session.user = {
          id: user.id,
          username: user.username,
          profile_image: user.profile_image,
        };

        // Ensure the session is saved properly
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session:', err);
            return res.status(500).json({ message: 'Failed to save session.' });
          }

          res.json({ message: 'Login successful!', user: req.session.user });
        });
      } else {
        return res.status(401).json({ message: 'Invalid password or username.' });
      }
    } catch (verifyError) {
      console.error('Password verification error:', verifyError);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  });
});

app.get('/verify-session', sessionMiddleware, (req, res) => {
  res.json({ message: 'Session active', user: req.user });
});

app.get('/profile', sessionMiddleware, (req, res) => {
  const { username, profile_image, id } = req.user;
  res.json({
    message: 'Profile data retrieved successfully',
    username: username,
    profile_image: profile_image,
    id: id
  });
});

function sessionMiddleware(req, res, next) {
  if (req.session.user) {
    const userId = req.session.user.id;
    const now = Date.now();

    // Check if suspension status was last checked more than 2 hours ago
    if (!req.session.lastSuspensionCheck || (now - req.session.lastSuspensionCheck) > 2 * 60 * 60 * 1000) {
      
      // Query the database to check if the user is suspended
      db.get('SELECT suspend FROM user WHERE id = ?', [userId], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Internal server error.' });
        }

        if (!result) {
          return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user is suspended
        if (result.suspend) {
          return res.redirect('/account-suspended');  // Redirect to the suspended page
        }

        // Update the last suspension check timestamp
        req.session.lastSuspensionCheck = now;

        // If not suspended, allow the request to proceed
        req.user = req.session.user;
        next();
      });
    } else {
      // If suspension check was done within the last 2 hours, skip querying the database
      req.user = req.session.user;
      next();
    }
  } else {
    return res.redirect('/login');  // Redirect to your login page route
  }
}


app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out.' });
    }
    res.json({ message: 'Logout successful!' });
  });
});

module.exports = { sessionMiddleware }; 

//////routing//////// 
app.use('/user', userService); 
app.use('/game', gameService); 
const PORT = 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
