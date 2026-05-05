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

Request body: The ID of the meme (string, 32 characters)

## 🗄️ PostgreSQL Database Schema

- Table: `likes`
  - `_id` (`VARCHAR(32)`, PRIMARY KEY): The unique identifier of the meme
  - `likes` (`INTEGER`, NOT NULL DEFAULT 0): The number of likes for the meme

```sql
CREATE TABLE likes (
  _id   VARCHAR(32) PRIMARY KEY,
  likes INTEGER NOT NULL DEFAULT 0
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
