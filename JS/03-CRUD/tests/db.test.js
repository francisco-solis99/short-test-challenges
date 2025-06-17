import { test, it } from 'node:test';
import assert from 'node:assert';
import { db } from '../db.js';

// check the connection to the database sqltite3

test('Database Connection', async (t) => {
  await t.test('should connect to the database without error', () => {
    db.exec('SELECT 1', (err) => {
      assert.ifError(err)
    })
  });

  await t.test('should have a books table', () => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='books'`,
      (err, row) => {
        assert.ifError(err);
        assert.ok(row, 'Books table should exist');
      }
    );
  });
});

test.after(() => {
  db.close()
})