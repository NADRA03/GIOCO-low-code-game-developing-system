const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); 
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors({
  origin: 'http://192.168.100.31:8081', 
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
    cookie: { secure: false }, 
  })
);

app.post('/login', (req, res) => {
  console.log('Login attempt received'); // Add this log
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
      };

      res.json({ message: 'Login successful!', user: req.session.user });
    } else {
      return res.status(401).json({ message: 'Invalid password.'  });
    }
  });
});



app.get('/verify-session', (req, res) => {
  if (req.session.user) {
    res.json({ message: 'Session active', user: req.session.user });
  } else {
    res.status(401).json({ message: 'No active session' });
  }
});



app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out.' });
    }
    res.json({ message: 'Logout successful!' });
  });
});



const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
