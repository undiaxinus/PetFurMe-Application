<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');
header('Access-Control-Allow-Methods: GET');

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Adjust include path
require_once __DIR__ . '/../../api/config/database.php';

// Define upload directories relative to project root
define('UPLOAD_BASE', __DIR__ . '/../../uploads/');
define('PET_PHOTOS_DIR', UPLOAD_BASE . 'pet_photos/');
define('USER_PHOTOS_DIR', UPLOAD_BASE . 'user_photos/');
define('PRODUCT_PHOTOS_DIR', UPLOAD_BASE . 'product_photos/');

// Add debug information
echo "Script location: " . __FILE__ . "\n";
echo "Upload base path: " . UPLOAD_BASE . "\n";

function createDirectories() {
    $dirs = [UPLOAD_BASE, PET_PHOTOS_DIR, USER_PHOTOS_DIR, PRODUCT_PHOTOS_DIR];
    foreach ($dirs as $dir) {
        if (!file_exists($dir)) {
            if (mkdir($dir, 0777, true)) {
                echo "Created directory: $dir\n";
                chmod($dir, 0777); // Ensure directory is writable
            } else {
                echo "Failed to create directory: $dir\n";
            }
        } else {
            echo "Directory exists: $dir\n";
            chmod($dir, 0777); // Ensure directory is writable
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
    
    // Extract pet photos
    $query = "SELECT id, photo, photo_blob FROM pets WHERE photo_blob IS NOT NULL";
    $result = mysqli_query($conn, $query);
    
    if ($result) {
        echo "\nProcessing pet photos...\n";
        while ($row = mysqli_fetch_assoc($result)) {
            if ($row['photo_blob']) {
                $filename = 'pet_' . $row['id'] . '_' . uniqid() . '.jpg';
                $filepath = PET_PHOTOS_DIR . $filename;
                
                echo "Attempting to save: $filepath\n";
                
                if (file_put_contents($filepath, $row['photo_blob'])) {
                    chmod($filepath, 0666); // Make file readable
                    echo "Saved file successfully\n";
                    
                    // Update database
                    $update = "UPDATE pets SET photo = ? WHERE id = ?";
                    $stmt = mysqli_prepare($conn, $update);
                    $relative_path = 'uploads/pet_photos/' . $filename;
                    mysqli_stmt_bind_param($stmt, "si", $relative_path, $row['id']);
                    
                    if (mysqli_stmt_execute($stmt)) {
                        echo "Updated database for pet ID {$row['id']}\n";
                    } else {
                        echo "Failed to update database: " . mysqli_error($conn) . "\n";
                    }
                } else {
                    echo "Failed to save file. Error: " . error_get_last()['message'] . "\n";
                }
            }
        }
    }
    
    // Similar process for users and products...
    
    echo "\nProcess completed!\n";
    
} catch (Exception $e) {
    http_response_code(500);
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} 