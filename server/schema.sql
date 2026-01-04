CREATE DATABASE IF NOT EXISTS political_canvas;
USE political_canvas;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','manager','volunteer') DEFAULT 'volunteer'
);

CREATE TABLE IF NOT EXISTS voters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  age INT,
  gender VARCHAR(10),
  party VARCHAR(50),
  leaning VARCHAR(50),
  consent BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  voter_id INT,
  user_id INT,
  sentiment VARCHAR(50),
  issues TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (voter_id) REFERENCES voters(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS walklists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  filter TEXT
);

CREATE TABLE IF NOT EXISTS territories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  assigned_to INT,
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
