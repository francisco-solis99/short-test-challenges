/*
  Create a CRUD (API-REST) with sqlite

    - Create the DB and the connection with the DB
    - Create the tables
    - Create the API Routes
    - Create tests


    // BOOK DB
    - id, name, author, isbn(numeros 13)
*/

import express from 'express'
import { db } from './db.js' // Assuming db.js is in the same directory

// Init express app
export const app = express()
const PORT = 4321;

// middlewares
app.use(express.json())



// API ROUTES with better-sqlite3

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/books', (req, res) => {
  db.all('SELECT * FROM books', [], (err, books) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch books', data: null });
    }
    res.status(200).json({
      message: 'Books fetched successfully',
      data: books
    });
  });
});

app.get('/api/books/:id', (req, res) => {
  const bookId = req.params.id;
  db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch book', data: null });
    }
    if (!book) {
      return res.status(404).json({ error: 'Book not found', data: null });
    }
    res.status(200).json({
      message: 'Book fetched successfully',
      data: book
    });
  });
});

app.post('/api/books', (req, res) => {
  const { name, author, isbn } = req.body;
  try {
    db.run('INSERT INTO books (name, author, isbn) VALUES (?, ?, ?)', [name, author, isbn]);
    res.status(201).json({
      message: 'Book created successfully',
      data: { name, author, isbn }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create book', data: null });
  }
}
);

app.put('/api/books/:id', (req, res) => {
  const bookId = req.params.id;
  const { name, author, isbn } = req.body;

  // First, get the current book data
  db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch book', data: null });
    }
    if (!book) {
      return res.status(404).json({ error: 'Book not found', data: null });
    }

    // Use new value if provided, otherwise keep the old value
    const updatedName = name !== undefined ? name : book.name;
    const updatedAuthor = author !== undefined ? author : book.author;
    const updatedIsbn = isbn !== undefined ? isbn : book.isbn;

    db.run(
      'UPDATE books SET name = ?, author = ?, isbn = ? WHERE id = ?',
      [updatedName, updatedAuthor, updatedIsbn, bookId],
      function (updateErr) {
        if (updateErr) {
          return res.status(500).json({ error: 'Failed to update book', data: null });
        }
        res.status(200).json({
          message: 'Book updated successfully',
          data: { id: bookId, name: updatedName, author: updatedAuthor, isbn: updatedIsbn }
        });
      }
    );
  });
});

app.delete('/api/books/:id', (req, res) => {
  const bookId = req.params.id;
  db.run('DELETE FROM books WHERE id = ?', [bookId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch book', data: null });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Book not found', data: null });
    }
    res.status(200).json({
      message: 'Book deleted successfully',
      data: { id: bookId }
    });
  });
});



// Listen the application
app.listen(PORT, () => {
  console.log('Listen on port ', PORT)
})
