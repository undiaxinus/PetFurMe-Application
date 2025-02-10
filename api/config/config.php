<?php
// Get the protocol
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';

// Get the host
$host = $_SERVER['HTTP_HOST'];

// Build the base URL
define('BASE_URL', $protocol . $host);
define('API_URL', BASE_URL . '/api');
define('STORAGE_URL', BASE_URL . '/storage');
define('UPLOADS_URL', BASE_URL . '/uploads');

// Database configuration should use environment variables
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'pet-management');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

define('PET_PHOTOS_URL', STORAGE_URL . '/pets/');
define('USER_PHOTOS_URL', STORAGE_URL . '/users/');
define('PRODUCT_PHOTOS_URL', STORAGE_URL . '/products/'); 