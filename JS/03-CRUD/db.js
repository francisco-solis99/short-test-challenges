import sqlite3 from 'sqlite3';

export const db = new sqlite3.Database('books.db', (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the books database.');
  }
});


// Create the books table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT NOT NULL UNIQUE
)`, (err) => {
  if (err) {
    console.error('Error creating table ' + err.message);
  } else {
    console.log('Books table is ready.');
  }
}
);


// Close the database connection