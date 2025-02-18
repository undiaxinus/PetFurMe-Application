<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/api/config/Database.php';

// Define upload directories based on your existing code
define('UPLOAD_BASE', __DIR__ . '/uploads/');
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
    echo "<pre>\n";
    
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
                
                if (file_put_contents($filepath, $row['photo_blob'])) {
                    // Update database with new file path
                    $update = "UPDATE pets SET photo = ? WHERE id = ?";
                    $stmt = mysqli_prepare($conn, $update);
                    $relative_path = 'uploads/pet_photos/' . $filename;
                    mysqli_stmt_bind_param($stmt, "si", $relative_path, $row['id']);
                    
                    if (mysqli_stmt_execute($stmt)) {
                        echo "Saved and updated pet photo: $filename\n";
                    } else {
                        echo "Failed to update database for pet ID {$row['id']}\n";
                    }
                } else {
                    echo "Failed to save photo for pet ID {$row['id']}\n";
                }
            }
        }
    }
    
    // Extract user photos
    $query = "SELECT id, photo, photo_blob FROM users WHERE photo_blob IS NOT NULL";
    $result = mysqli_query($conn, $query);
    
    if ($result) {
        echo "\nProcessing user photos...\n";
        while ($row = mysqli_fetch_assoc($result)) {
            if ($row['photo_blob']) {
                $filename = 'user_' . $row['id'] . '_' . uniqid() . '.jpg';
                $filepath = USER_PHOTOS_DIR . $filename;
                
                if (file_put_contents($filepath, $row['photo_blob'])) {
                    $update = "UPDATE users SET photo = ? WHERE id = ?";
                    $stmt = mysqli_prepare($conn, $update);
                    $relative_path = 'uploads/user_photos/' . $filename;
                    mysqli_stmt_bind_param($stmt, "si", $relative_path, $row['id']);
                    
                    if (mysqli_stmt_execute($stmt)) {
                        echo "Saved and updated user photo: $filename\n";
                    }
                }
            }
        }
    }
    
    // Extract product photos
    $query = "SELECT id, product_image, product_image_blob FROM products WHERE product_image_blob IS NOT NULL";
    $result = mysqli_query($conn, $query);
    
    if ($result) {
        echo "\nProcessing product photos...\n";
        while ($row = mysqli_fetch_assoc($result)) {
            if ($row['product_image_blob']) {
                $filename = 'product_' . $row['id'] . '_' . uniqid() . '.jpg';
                $filepath = PRODUCT_PHOTOS_DIR . $filename;
                
                if (file_put_contents($filepath, $row['product_image_blob'])) {
                    $update = "UPDATE products SET product_image = ? WHERE id = ?";
                    $stmt = mysqli_prepare($conn, $update);
                    $relative_path = 'uploads/product_photos/' . $filename;
                    mysqli_stmt_bind_param($stmt, "si", $relative_path, $row['id']);
                    
                    if (mysqli_stmt_execute($stmt)) {
                        echo "Saved and updated product photo: $filename\n";
                    }
                }
            }
        }
    }
    
    echo "\nProcess completed!\n";
    echo "</pre>\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} 