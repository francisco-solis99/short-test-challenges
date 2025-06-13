from flask import Flask, request, jsonify, g
import sqlite3

app = Flask(__name__)
DATABASE = 'database.db'

# Database connection
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

# Close connection automatically
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# Create the CRUD endpoints

#add a book ✅
@app.route('/books', methods=['POST'])
def create_book():
    data = request.get_json()
    db = get_db()
    cursor = db.cursor()
    cursor.execute('INSERT INTO books (title, author, ISBN) VALUES(?, ?, ?)',
                (data['title'], data['author'], data['ISBN']))
    db.commit()
    return jsonify({'message': f'Libro {data['title']} con el id {cursor.lastrowid} creado con exito!'}), 201

#read all books ✅
@app.route('/books', methods=['GET'])
def get_books():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM books')
    books = cursor.fetchall()
    if not books:
        return jsonify({'message': 'No hay libros disponibles'}), 404
    return jsonify([{'id': book[0], 'title': book[1], 'author': book[2], 'ISBN': book[3]} for book in books]), 200

#read a book by id ✅
@app.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM books WHERE id = ?', (book_id,))
    book = cursor.fetchone()
    if book:
        return jsonify({'id': book[0], 'title': book[1], 'author': book[2], 'ISBN': book[3]}), 200
    else:
        return jsonify({'message': 'Libro no encontrado'}), 404

#update a book ✅
@app.route('/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    data = request.get_json()
    db = get_db()
    cursor = db.cursor()
    cursor.execute('UPDATE books SET title = ?, author = ?, ISBN = ? WHERE id = ?',
                (data['title'], data['author'], data['ISBN'], book_id))
    db.commit()
    if cursor.rowcount > 0:
        return jsonify({'message': f'Libro con id {book_id} actualizado con exito!'}), 200
    else:
        return jsonify({'message': 'Libro no encontrado'}), 404

#delete a book ✅
@app.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('DELETE FROM books WHERE id = ?', (book_id,))
    db.commit()
    if cursor.rowcount > 0:
        return jsonify({'message': f'Libro con id {book_id} eliminado con exito!'}), 200
    else:
        return jsonify({'message': 'Libro no encontrado'}), 404

#initialize the database
def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

# Run the application in the port 3000
if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=3000)