<?php
/**
 * Configuration file for SoMe Planner
 * Copy this file to config.php and update with your settings
 */

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'some_planner');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_CHARSET', 'utf8mb4');

// Application settings
define('APP_NAME', 'SoMe Planner');
define('APP_URL', 'http://localhost');

// Upload settings
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('UPLOAD_MAX_SIZE', 50 * 1024 * 1024); // 50MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_VIDEO_TYPES', ['video/mp4', 'video/quicktime', 'video/x-msvideo']);

// Session settings
define('SESSION_LIFETIME', 3600 * 8); // 8 hours

// Security
define('CSRF_TOKEN_NAME', 'csrf_token');

// Admin credentials (in production, use proper password hashing)
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', '$2y$10$example_hash_here'); // Use password_hash() to generate
