<?php
/**
 * Configuration file for SoMe Planner
 * This is a development configuration file
 * For production, update with secure credentials
 */

// Database configuration
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'someplanner');
define('DB_USER', 'root');
define('DB_PASS', '2010Thuva');
define('DB_CHARSET', 'utf8mb4');

// Application settings
define('APP_NAME', 'SoMe Planner');
define('APP_URL', 'https://someplanner.test');

// Upload settings
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('UPLOAD_MAX_SIZE', 50 * 1024 * 1024); // 50MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_VIDEO_TYPES', ['video/mp4', 'video/quicktime', 'video/x-msvideo']);

// Session settings
define('SESSION_LIFETIME', 3600 * 8); // 8 hours

// Security
define('CSRF_TOKEN_NAME', 'csrf_token');

// Admin credentials (CHANGE THESE IN PRODUCTION!)
define('ADMIN_USERNAME', 'admin');
// Default password is 'admin123' - CHANGE THIS!
define('ADMIN_PASSWORD_HASH', '$2y$10$KkqCze4Yoh83QsG4LCy/ueBW8VF1nyiQvyOTemP4jF0ZPI95WBPsK');
