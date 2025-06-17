import { test, it } from 'node:test';
import assert from 'node:assert';
import { app } from '../main.js';
import http from 'node:http';


function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port: 4321, path, method: options.method || 'GET', headers: options.headers || {} },
      (res) => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        });
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

test('GET /books should return an array of books', async () => {
  const res = await makeRequest('/api/books');
  assert.strictEqual(res.status, 200);
  const { data: books } = JSON.parse(res.body);
  assert.ok(Array.isArray(books));
});

test('GET /books/:id should return a single book', async () => {
  const res = await makeRequest('/api/books/1');
  assert.strictEqual(res.status, 200);
  const { data: book } = JSON.parse(res.body);
  assert.ok(book);
  assert.strictEqual(book.id, 1);
});

test('POST /books should create a book', async () => {
  const newBook = JSON.stringify({ name: 'Native Node', author: 'Node', isbn: '9876543210' });
  const res = await makeRequest('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(newBook) },
    body: newBook,
  });
  assert.strictEqual(res.status, 201);
  const { data: book } = JSON.parse(res.body);
  assert.strictEqual(book.name, 'Native Node');
});


test('PUT /books/:id should update a book', async () => {
  const updatedBook = JSON.stringify({ name: 'Native Node Updated', author: 'Node', isbn: '9876543210' });
  const res = await makeRequest('/api/books/1', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: updatedBook,
  });
  assert.strictEqual(res.status, 200);
  const { data: book } = JSON.parse(res.body);
  assert.strictEqual(book.name, 'Native Node Updated');
});

// test('DELETE /books/:id should delete a book', async () => {
//   const res = await makeRequest('/api/books/1', {
//     method: 'DELETE',
//   });
//   assert.strictEqual(res.status, 200);
//   const { data: book } = JSON.parse(res.body);
//   console.log(book)
//   // assert.strictEqual(book.id, 1);
// });

// test('GET /books/:id after deletion should return 404', async () => {
//   const res = await makeRequest('/api/books/1');
//   assert.strictEqual(res.status, 404);
//   const { error } = JSON.parse(res.body);
//   assert.strictEqual(error, 'Book not found');
// });

// test('POST /books with missing fields should return 400', async () => {
//   const newBook = JSON.stringify({ name: 'Incomplete Book' });
//   const res = await makeRequest('/api/books', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(newBook) },
//     body: newBook,
//   });
//   assert.strictEqual(res.status, 400);
//   const { error } = JSON.parse(res.body);
//   assert.strictEqual(error, 'Missing required fields');
// });
