import hashlib
import logging
import os

from flask import Flask, jsonify, request
from flask_cors import CORS  # type: ignore
import psycopg
from psycopg_pool import ConnectionPool

LIKES_PER_USER_PER_MEME = 10

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

pool = ConnectionPool(
    conninfo=os.environ["DATABASE_URL"],
    min_size=1,
    max_size=5,
    kwargs={"autocommit": True},
)


def client_ip_hash() -> str:
    fwd = request.headers.get("X-Forwarded-For", "")
    ip = fwd.split(",")[0].strip() if fwd else (request.remote_addr or "")
    return hashlib.sha256(ip.encode("utf-8")).hexdigest()


@app.route('/get_all', methods=['GET'])
def get_all():
    try:
        with pool.connection() as conn, conn.cursor() as cur:
            cur.execute("SELECT _id, likes FROM likes")
            results = [{"_id": row[0], "likes": row[1]} for row in cur.fetchall()]
        return jsonify({"result": results})
    except psycopg.Error:
        app.logger.exception("get_all failed")
        return jsonify({"error": "Database error"}), 500


@app.route('/increment_one', methods=['POST'])
def increment_one():
    meme_id = request.data.decode('utf-8')
    if len(meme_id) != 32:
        return jsonify({"error": "Invalid meme ID"}), 400
    ip_hash = client_ip_hash()
    try:
        with pool.connection() as conn, conn.cursor() as cur:
            # Atomic: bump per-(ip, meme) counter only if under cap, then bump
            # global tally only if the per-user bump succeeded.
            cur.execute(
                """
                WITH event AS (
                    INSERT INTO like_events (ip_hash, meme_id, count)
                    VALUES (%s, %s, 1)
                    ON CONFLICT (ip_hash, meme_id) DO UPDATE
                      SET count = like_events.count + 1
                      WHERE like_events.count < %s
                    RETURNING count
                )
                INSERT INTO likes (_id, likes)
                SELECT %s, 1 FROM event
                ON CONFLICT (_id) DO UPDATE
                  SET likes = likes.likes + 1
                RETURNING likes
                """,
                (ip_hash, meme_id, LIKES_PER_USER_PER_MEME, meme_id),
            )
            row = cur.fetchone()
        if row is None:
            return jsonify({"error": "Like limit reached"}), 429
        return jsonify({"result": "success"})
    except psycopg.Error:
        app.logger.exception("increment_one failed")
        return jsonify({"error": "Database error"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
