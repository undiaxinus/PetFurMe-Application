<?php
// Place this file in your project root
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/api/config/Database.php';

// Define paths relative to project root
define('STORAGE_BASE', __DIR__ . '/storage/');
define('PET_PHOTOS_PATH', STORAGE_BASE . 'pets/');
define('USER_PHOTOS_PATH', STORAGE_BASE . 'users/');
define('PRODUCT_PHOTOS_PATH', STORAGE_BASE . 'products/');

// Rest of your restore code... 