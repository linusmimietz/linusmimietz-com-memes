---
title: Flask Backend for Memes App
description: A Flask backend server for handling likes in the Memes app
tags:
  - python
  - flask
  - mysql
---

# Flask Backend for Memes App

This is a [Flask](https://flask.palletsprojects.com/) backend server that handles like counts for the Memes app. It interacts with a MySQL database to store and retrieve like counts for each meme.

## ✨ Features

- Python
- Flask
- MySQL database integration
- CORS support
- Railway deployment

## 💁‍♀️ How to use

- Install Python requirements: `pip install -r requirements.txt`
- Set the following environment variables:
  - `MYSQLHOST`: MySQL database host
  - `MYSQLUSER`: MySQL database user
  - `MYSQLPASSWORD`: MySQL database password
  - `MYSQL_DATABASE`: MySQL database name
- Start the server for development: `python main.py`

## 🚀 Deployment

This backend server can be easily deployed on [Railway](https://railway.app/) using the provided `railway.json` configuration file. Simply click the "Deploy on Railway" button in this README to set up a new project with this template.

## 📡 API Endpoints

### GET `/get_all`

Retrieves all documents from the "likes" table in the MySQL database.

### POST `/increment_one`

Increments the like count for a specific meme. If the meme document does not exist, it will be created with an initial like count of 1.

Request body: The ID of the meme (string, 32 characters)

## 🗄️ MySQL Database Schema

- Table: `likes`
  - `_id` (VARCHAR(32), PRIMARY KEY): The unique identifier of the meme
  - `likes` (INT): The number of likes for the meme

## 🧩 Dependencies

- Flask: Web framework
- flask-cors: CORS support
- mysql-connector-python: MySQL database connector
- python-dotenv: Environment variable management
- gunicorn: Production-grade WSGI HTTP server

For detailed dependencies, please refer to the `requirements.txt` file.
