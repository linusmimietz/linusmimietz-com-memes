from flask import Flask, jsonify, request
from flask_cors import CORS  # type: ignore
import os
import psycopg
from psycopg_pool import ConnectionPool

app = Flask(__name__)
CORS(app)

pool = ConnectionPool(
    conninfo=os.environ["DATABASE_URL"],
    min_size=1,
    max_size=5,
    kwargs={"autocommit": True},
)


@app.route('/get_all', methods=['GET'])
def get_all():
    try:
        with pool.connection() as conn, conn.cursor() as cur:
            cur.execute("SELECT _id, likes FROM likes")
            results = [{"_id": row[0], "likes": row[1]} for row in cur.fetchall()]
        return jsonify({"result": results})
    except psycopg.Error as e:
        return jsonify({"error": str(e)}), 500


@app.route('/increment_one', methods=['POST'])
def increment_one():
    meme_id = request.data.decode('utf-8')
    if len(meme_id) != 32:
        return jsonify({"error": "Invalid meme ID"}), 400
    try:
        with pool.connection() as conn, conn.cursor() as cur:
            cur.execute(
                "INSERT INTO likes (_id, likes) VALUES (%s, 1) "
                "ON CONFLICT (_id) DO UPDATE SET likes = likes.likes + 1",
                (meme_id,),
            )
        return jsonify({"result": "success"})
    except psycopg.Error as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
