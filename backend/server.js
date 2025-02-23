const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); 
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const cors = require('cors');
const app = express();
//Services
const userService = require('./routes/userService'); 
const gameService = require('./routes/gameService'); // Importing profile routes
app.use(cors({
  // origin: 'http://172.20.10.1:8082',                ///////////here//////////////
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
    saveUninitialized: false,
    cookie: {   secure: false, 
      maxAge: 30 * 24 * 60 * 60 * 1000  }, 
      store: new SQLiteStore({
        db: 'sessions.db',
      }),
  })
);

app.post('/login', (req, res) => {
  console.log('Login attempt received'); 
  console.log('Request body:', req.body); 
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  const query = 'SELECT * FROM user WHERE username = ?';
  db.get(query, [username], (err, user) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    console.log('User found in database:', user); 
    if (!user) {
      return res.status(401).json({message: 'Invalid username.' });
    }

    if (password === user.password) {
      req.session.user = {
        id: user.id,
        username: user.username,
        profile_image: user.profile_image,
      };

      res.json({ message: 'Login successful!', user: req.session.user });
    } else {
      return res.status(401).json({ message: 'Invalid password.'  });
    }
  });
});

app.get('/profile_all', sessionMiddleware, (req, res) => {
  const userId = req.user.id; 

  const query = 'SELECT * FROM user WHERE id = ?';
  db.get(query, [userId], (err, user) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      message: 'Profile data retrieved successfully',
      user: user, 
    });
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
    req.user = req.session.user; 
    next();
  } else {
    res.status(401).json({ message: 'No active session, please log in.' });
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


//////routing//////// 
app.use('/user', userService); 
app.use('/game', gameService); 

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
