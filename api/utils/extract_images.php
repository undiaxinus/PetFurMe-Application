<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log the script execution
error_log("Extract images script started");

// Include database configuration
require_once __DIR__ . '/../config/Database.php';

// Define paths relative to project root
$project_root = realpath(__DIR__ . '/../../');
define('UPLOADS_DIR', $project_root . '/uploads');
define('PET_PHOTOS_DIR', UPLOADS_DIR . '/pet_photos');
define('USER_PHOTOS_DIR', UPLOADS_DIR . '/user_photos');
define('PRODUCT_PHOTOS_DIR', UPLOADS_DIR . '/product_photos');

echo "Script started...\n";
echo "Project root: " . $project_root . "\n";

try {
    // Create directories with full permissions
    foreach ([UPLOADS_DIR, PET_PHOTOS_DIR, USER_PHOTOS_DIR, PRODUCT_PHOTOS_DIR] as $dir) {
        if (!file_exists($dir)) {
            if (mkdir($dir, 0777, true)) {
                chmod($dir, 0777);
                echo "Created directory: $dir\n";
            } else {
                throw new Exception("Failed to create directory: $dir");
            }
        } else {
            chmod($dir, 0777);
        }
    }

    // Connect to database
    $database = new Database();
    $conn = $database->connect();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    echo "Connected to database\n";

    // Debug: Show current working directory
    echo "Current working directory: " . getcwd() . "\n";

    // Process pet photos
    $query = "SELECT id, photo FROM pets WHERE photo IS NOT NULL";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        echo "Query failed: " . mysqli_error($conn) . "\n";
    } else {
        $num_rows = mysqli_num_rows($result);
        echo "\nFound $num_rows pet photos to process\n";
        
        while ($row = mysqli_fetch_assoc($result)) {
            if (!empty($row['photo'])) {
                $source = $row['photo'];
                $filename = basename($source);
                $target_path = PET_PHOTOS_DIR . '/' . $filename;
                
                echo "\nProcessing pet ID: {$row['id']}\n";
                echo "Source: $source\n";
                echo "Target: $target_path\n";
                
                // Try to find and copy the image from various locations
                $possible_sources = [
                    $project_root . '/' . $source,
                    $project_root . '/public/' . $source,
                    $_SERVER['DOCUMENT_ROOT'] . '/' . $source,
                    $_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/' . $source,
                    $source
                ];
                
                $copied = false;
                foreach ($possible_sources as $try_source) {
                    echo "Trying source: $try_source\n";
                    if (file_exists($try_source)) {
                        if (copy($try_source, $target_path)) {
                            chmod($target_path, 0666);
                            $copied = true;
                            echo "Successfully copied from: $try_source\n";
                            
                            // Update database with correct path
                            $relative_path = 'uploads/pet_photos/' . $filename;
                            $update = "UPDATE pets SET photo = ? WHERE id = ?";
                            $stmt = mysqli_prepare($conn, $update);
                            mysqli_stmt_bind_param($stmt, "si", $relative_path, $row['id']);
                            
                            if (mysqli_stmt_execute($stmt)) {
                                echo "Updated database path for pet ID {$row['id']}\n";
                            } else {
                                echo "Failed to update database: " . mysqli_error($conn) . "\n";
                            }
                            break;
                        }
                    }
                }
                
                if (!$copied) {
                    echo "Failed to copy file from any location\n";
                    // Try to download if it's a URL
                    if (filter_var($source, FILTER_VALIDATE_URL)) {
                        $image_data = @file_get_contents($source);
                        if ($image_data) {
                            if (file_put_contents($target_path, $image_data)) {
                                chmod($target_path, 0666);
                                echo "Successfully downloaded from URL\n";
                                
                                // Update database with new path
                                $relative_path = 'uploads/pet_photos/' . $filename;
                                $update = "UPDATE pets SET photo = ? WHERE id = ?";
                                $stmt = mysqli_prepare($conn, $update);
                                mysqli_stmt_bind_param($stmt, "si", $relative_path, $row['id']);
                                mysqli_stmt_execute($stmt);
                            }
                        }
                    }
                }
            }
        }
    }

    // Process existing user photos
    $query = "SELECT id, photo FROM users WHERE photo IS NOT NULL";
    $result = mysqli_query($conn, $query);
    
    if ($result) {
        echo "\nProcessing user photos...\n";
        while ($row = mysqli_fetch_assoc($result)) {
            if (!empty($row['photo'])) {
                $source = $row['photo'];
                $filename = basename($source);
                $target_path = USER_PHOTOS_DIR . '/' . $filename;
                
                // Similar copy logic as above
                if (filter_var($source, FILTER_VALIDATE_URL)) {
                    $image_data = @file_get_contents($source);
                    if ($image_data) {
                        file_put_contents($target_path, $image_data);
                    }
                } else {
                    $local_source = $project_root . '/' . ltrim($source, '/');
                    if (file_exists($local_source)) {
                        echo "Copying from: $local_source\n";
                        echo "To: $target_path\n";
                        if (copy($local_source, $target_path)) {
                            echo "Copy successful\n";
                            echo "New file size: " . filesize($target_path) . " bytes\n";
                        } else {
                            echo "Copy failed\n";
                            echo "PHP error: " . error_get_last()['message'] . "\n";
                        }
                    }
                }
                
                if (file_exists($target_path)) {
                    $relative_path = 'uploads/user_photos/' . $filename;
                    $update = "UPDATE users SET photo = ? WHERE id = ?";
                    $stmt = mysqli_prepare($conn, $update);
                    mysqli_stmt_bind_param($stmt, "si", $relative_path, $row['id']);
                    mysqli_stmt_execute($stmt);
                }
            }
        }
    }

    echo "\nProcess completed!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    error_log("Extract images error: " . $e->getMessage());
} 