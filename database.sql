-- ==========================================================
-- Password Strength Checker - Database Setup Script
-- ==========================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS password_checker_db;

-- 2. Select the database to use
USE password_checker_db;

-- 3. Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. (Optional) View all registered users
-- SELECT id, full_name, username, email, created_at FROM users;
