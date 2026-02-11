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
  consent BOOLEAN DEFAULT FALSE,
  territory_id INT,
  last_contacted TIMESTAMP NULL,
  contact_status ENUM('not_contacted', 'contacted', 'supporter', 'undecided', 'opposed', 'not_home', 'do_not_contact') DEFAULT 'not_contacted',
  FOREIGN KEY (territory_id) REFERENCES territories(id) ON DELETE SET NULL
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
  territory_id INT,
  assigned_to INT,
  status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (territory_id) REFERENCES territories(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS territories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  area_type ENUM('neighborhood', 'street', 'ward', 'district', 'custom') DEFAULT 'custom',
  assigned_to INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);
