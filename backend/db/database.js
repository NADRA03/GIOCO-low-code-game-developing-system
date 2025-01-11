const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../TapTale.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

module.exports = db;