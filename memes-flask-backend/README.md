---
title: Flask Backend for Memes App
description: A Flask backend server for handling likes in the Memes app
tags:
  - python
  - flask
  - postgres
---

# Flask Backend for Memes App

This is a [Flask](https://flask.palletsprojects.com/) backend server that handles like counts for the Memes app. It interacts with a PostgreSQL database (via psycopg with a connection pool) to store and retrieve like counts for each meme.

## ✨ Features

- Python
- Flask
- PostgreSQL via psycopg 3
- Process-wide connection pool (`psycopg_pool`)
- CORS support
- Railway deployment

## 💁‍♀️ How to use

- Install Python requirements: `pip install -r requirements.txt`
- Set the following environment variable:
  - `DATABASE_URL`: PostgreSQL connection string (Railway injects this automatically when a Postgres plugin is attached to the same project/environment)
- Start the server for development: `python main.py`

## 🚀 Deployment

This backend server is deployed on [Railway](https://railway.app/) using the provided `railway.json` configuration. Deploys are triggered by pushes to `main` via the GitHub CI/CD integration.

## 📡 API Endpoints

### GET `/get_all`

Retrieves all rows from the `likes` table.

### POST `/increment_one`

Increments the like count for a specific meme. If the meme row does not exist, it is created with an initial like count of 1.

Request body: The ID of the meme (string, 32 characters).

**Server-side cap:** each client (identified by SHA-256 hash of the request IP) is allowed at most **10** likes per meme. Once the cap is reached the endpoint returns HTTP `429 Too Many Requests` and the global like count is not incremented.

## 🗄️ PostgreSQL Database Schema

- Table: `likes`
  - `_id` (`VARCHAR(32)`, PRIMARY KEY): The unique identifier of the meme
  - `likes` (`INTEGER`, NOT NULL DEFAULT 0): The number of likes for the meme
- Table: `like_events`
  - `ip_hash` (`CHAR(64)`): SHA-256 hex of the client IP
  - `meme_id` (`VARCHAR(32)`): The meme being liked
  - `count` (`INTEGER`, NOT NULL DEFAULT 0): How many times this client has liked this meme
  - PRIMARY KEY (`ip_hash`, `meme_id`)

```sql
CREATE TABLE likes (
  _id   VARCHAR(32) PRIMARY KEY,
  likes INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE like_events (
  ip_hash CHAR(64)      NOT NULL,
  meme_id VARCHAR(32)   NOT NULL,
  count   INTEGER       NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, meme_id)
);
```

## 🧩 Dependencies

- Flask: Web framework
- flask-cors: CORS support
- psycopg[binary]: PostgreSQL driver (v3)
- psycopg_pool: Connection pool
- python-dotenv: Environment variable management
- gunicorn: Production-grade WSGI HTTP server

For exact pinned versions, see `requirements.txt`.
