<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once '../config/database.php';

// Define base paths for different image types
define('STORAGE_BASE', __DIR__ . '/../../storage/');
define('PET_PHOTOS_PATH', STORAGE_BASE . 'pets/');
define('USER_PHOTOS_PATH', STORAGE_BASE . 'users/');
define('PRODUCT_PHOTOS_PATH', STORAGE_BASE . 'products/');

function ensureDirectoriesExist() {
    $dirs = [
        PET_PHOTOS_PATH,
        USER_PHOTOS_PATH,
        PRODUCT_PHOTOS_PATH
    ];
    
    foreach ($dirs as $dir) {
        echo "Checking directory: $dir\n";
        if (!file_exists($dir)) {
            echo "Directory doesn't exist, creating...\n";
            if (!mkdir($dir, 0777, true)) {
                throw new Exception("Failed to create directory: $dir");
            }
            echo "Created directory: $dir\n";
        } else {
            echo "Directory exists: $dir\n";
        }
    }
}

function restoreMissingImages() {
    $database = new Database();
    $conn = $database->connect();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    echo "Connected to database successfully\n";
    
    // Restore pet photos
    $query = "SELECT id, photo, photo_blob FROM pets WHERE photo_blob IS NOT NULL";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception("Query failed: " . mysqli_error($conn));
    }
    
    echo "Found " . mysqli_num_rows($result) . " pets with photos to restore\n";
    
    while ($row = mysqli_fetch_assoc($result)) {
        if ($row['photo_blob']) {
            $filename = 'pet_' . $row['id'] . '_' . uniqid() . '.jpg';
            $photo_path = PET_PHOTOS_PATH . $filename;
            
            echo "Attempting to save photo for pet ID {$row['id']} to: $photo_path\n";
            
            if (file_put_contents($photo_path, $row['photo_blob'])) {
                // Update the photo path in database
                $update_query = "UPDATE pets SET photo = ? WHERE id = ?";
                $stmt = mysqli_prepare($conn, $update_query);
                if (!$stmt) {
                    echo "Failed to prepare update statement: " . mysqli_error($conn) . "\n";
                    continue;
                }
                mysqli_stmt_bind_param($stmt, "si", $filename, $row['id']);
                if (mysqli_stmt_execute($stmt)) {
                    echo "Successfully restored and updated pet photo: $filename\n";
                } else {
                    echo "Failed to update database for pet ID {$row['id']}: " . mysqli_error($conn) . "\n";
                }
            } else {
                echo "Failed to save photo for pet ID {$row['id']}\n";
            }
        }
    }
    
    // Restore user photos
    $query = "SELECT id, photo, photo_blob FROM users WHERE photo_blob IS NOT NULL";
    $result = mysqli_query($conn, $query);
    
    while ($row = mysqli_fetch_assoc($result)) {
        if ($row['photo_blob']) {
            $filename = 'user_' . $row['id'] . '_' . uniqid() . '.jpg';
            $photo_path = USER_PHOTOS_PATH . $filename;
            
            if (file_put_contents($photo_path, $row['photo_blob'])) {
                $update_query = "UPDATE users SET photo = ? WHERE id = ?";
                $stmt = mysqli_prepare($conn, $update_query);
                mysqli_stmt_bind_param($stmt, "si", $filename, $row['id']);
                mysqli_stmt_execute($stmt);
                echo "Restored user photo: $filename\n";
            }
        }
    }
    
    // Restore product photos
    $query = "SELECT id, product_image, product_image_blob FROM products WHERE product_image_blob IS NOT NULL";
    $result = mysqli_query($conn, $query);
    
    while ($row = mysqli_fetch_assoc($result)) {
        if ($row['product_image_blob']) {
            $filename = 'product_' . $row['id'] . '_' . uniqid() . '.jpg';
            $photo_path = PRODUCT_PHOTOS_PATH . $filename;
            
            if (file_put_contents($photo_path, $row['product_image_blob'])) {
                $update_query = "UPDATE products SET product_image = ? WHERE id = ?";
                $stmt = mysqli_prepare($conn, $update_query);
                mysqli_stmt_bind_param($stmt, "si", $filename, $row['id']);
                mysqli_stmt_execute($stmt);
                echo "Restored product photo: $filename\n";
            }
        }
    }
    
    mysqli_close($conn);
}

// Run the restore process
try {
    echo "<pre>\n"; // For better formatting in browser
    echo "Starting image restoration process...\n";
    echo "Script running from: " . __DIR__ . "\n";
    
    ensureDirectoriesExist();
    restoreMissingImages();
    
    echo "Image restore completed successfully\n";
    echo "</pre>\n";
} catch (Exception $e) {
    echo "<pre>\n";
    echo "Error restoring images: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    echo "</pre>\n";
} 