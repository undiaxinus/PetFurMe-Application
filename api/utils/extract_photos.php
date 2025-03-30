<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain'); // For better readability of output
header('Access-Control-Allow-Methods: GET');

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../config/database.php';

// Define upload directories relative to API directory
define('UPLOAD_BASE', __DIR__ . '/../../uploads/');
define('PET_PHOTOS_DIR', UPLOAD_BASE . 'pet_photos/');
define('USER_PHOTOS_DIR', UPLOAD_BASE . 'user_photos/');
define('PRODUCT_PHOTOS_DIR', UPLOAD_BASE . 'product_photos/');

function createDirectories() {
    $dirs = [UPLOAD_BASE, PET_PHOTOS_DIR, USER_PHOTOS_DIR, PRODUCT_PHOTOS_DIR];
    foreach ($dirs as $dir) {
        if (!file_exists($dir)) {
            if (mkdir($dir, 0777, true)) {
                echo "Created directory: $dir\n";
            } else {
                echo "Failed to create directory: $dir\n";
            }
        } else {
            echo "Directory exists: $dir\n";
        }
    }
}

try {
    // Create database connection
    $database = new Database();
    $conn = $database->connect();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    echo "Database connected successfully\n";
    
    // Create directories
    createDirectories();
    
    // Rest of your extraction code...
    
} catch (Exception $e) {
    http_response_code(500);
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} 