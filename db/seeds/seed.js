const db = require('../connection.js');
const format = require('pg-format');

const seed = async data => {
  const { categoryData, commentData, reviewData, userData } = data;
  // DROP TABLES
  await db.query('DROP TABLE IF EXISTS comments');
  await db.query('DROP TABLE IF EXISTS reviews');
  await db.query('DROP TABLE IF EXISTS users');
  await db.query('DROP TABLE IF EXISTS categories');

  console.log('tables dropped!');

  // 1. create tables
  await db.query(`
    CREATE TABLE categories (
      slug VARCHAR(100) PRIMARY KEY NOT NULL,
      description TEXT NOT NULL
    )`);

  await db.query(`
    CREATE TABLE users (
      username VARCHAR(100) PRIMARY KEY NOT NULL,
      avatar_url TEXT,
      name VARCHAR(100)
    )`);

  await db.query(`
    CREATE TABLE reviews (
      review_id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      review_body TEXT NOT NULL,
      designer VARCHAR(100) NOT NULL,
      review_img_url TEXT DEFAULT 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
      votes INT DEFAULT 0,
      category VARCHAR(100) REFERENCES categories(slug),
      owner VARCHAR(100) REFERENCES users(username),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  await db.query(`
    CREATE TABLE comments (
      comment_id SERIAL PRIMARY KEY,
      author VARCHAR(100) REFERENCES users(username) NOT NULL,
      review_id INT REFERENCES reviews(review_id) NOT NULL,
      votes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      body TEXT
    )`);

  console.log('tables created!');
  // 2. insert data
};

module.exports = seed;
