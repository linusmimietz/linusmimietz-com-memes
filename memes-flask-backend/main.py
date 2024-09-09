from flask import Flask, jsonify, request
from flask_cors import CORS # type: ignore
import os
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes and origins

# MySQL connection configuration
db_config = {
    'host': os.getenv('MYSQLHOST'),
    'user': os.getenv('MYSQLUSER'),
    'password': os.getenv('MYSQLPASSWORD'),
    'database': os.getenv('MYSQL_DATABASE')
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

@app.route('/get_all', methods=['GET'])
def get_all():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM likes")
        results = cursor.fetchall()
        return jsonify({"result": results})
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/increment_one', methods=['POST'])
def increment_one():
    meme_id = request.data.decode('utf-8')
    if len(meme_id) != 32:
        return jsonify({"error": "Invalid meme ID"}), 400
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO likes (_id, likes) VALUES (%s, 1) ON DUPLICATE KEY UPDATE likes = likes + 1",
            (meme_id,)
        )
        connection.commit()
        return jsonify({"result": "success"})
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
