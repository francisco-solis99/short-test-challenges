import pytest
from app import app
import sqlite3

@pytest.fixture
def client():
    app.config['DATABASE'] = ':memory:'  # Use an in-memory database for testing
    with app.test_client() as client:
        with app.app_context():
            # Create the database schema
            db = sqlite3.connect(':memory:')
            cursor = db.cursor()
            cursor.execute('DROP TABLE IF EXISTS books')  # Ensure the table is fresh
            cursor.execute('''
                CREATE TABLE books (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    author TEXT NOT NULL,
                    ISBN VARCHAR(13) NOT NULL
                )
            ''')
            db.commit()
        yield client # This is where the tests will run

def test_add_and_delete_book(client):
    # Data for the book to be added
    book_data = {
        "title": "Coraline",
        "author": "Neil Gaiman",
        "ISBN": "9780380807345"
    }
    
    # 1. Create a book
    response = client.post('/books', json=book_data)
    assert response.status_code == 201
    book_id = response.get_json()['id']
    
    # 2. Delete the book
    delete_response = client.delete(f'/books/{book_id}')
    assert delete_response.status_code == 200
    
    # 3. Verify the book is deleted
    get_response = client.get(f'/books/{book_id}')
    assert get_response.status_code == 404