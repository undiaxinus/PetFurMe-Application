<?php
header('Content-Type: text/plain');

require_once __DIR__ . '/../config/database.php';

// Define paths
$project_root = realpath(__DIR__ . '/../../');
$uploads_dir = $project_root . '/uploads';

// Source directories
$source_base = 'D:/XAMPP/htdocs/PetFurme/public/storage';
$source_dirs = [
    'pet_photos' => $source_base . '/pet_photos',
    'user_photos' => $source_base . '/user_photos',
    'products' => $source_base . '/products',
    'defaults' => $source_base . '/defaults'
];

// Target directories
$target_dirs = [
    'pet_photos' => $uploads_dir . '/pet_photos',
    'user_photos' => $uploads_dir . '/user_photos',
    'products' => $uploads_dir . '/products',
    'defaults' => $uploads_dir . '/defaults'
];

try {
    $database = new Database();
    $conn = $database->connect();
    
    // Create all necessary directories
    echo "Setting up directories...\n";
    foreach ($target_dirs as $name => $dir) {
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
            echo "Created directory: $dir\n";
        }
        chmod($dir, 0777);
    }
    echo "\n";

    // Copy all files from each source directory
    foreach ($source_dirs as $type => $source_dir) {
        echo "Processing $type directory...\n";
        echo "Source: $source_dir\n";
        echo "Target: {$target_dirs[$type]}\n";

        if (!file_exists($source_dir)) {
            echo "Source directory does not exist: $source_dir\n\n";
            continue;
        }

        $files = scandir($source_dir);
        $fileCount = 0;

        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;

            $source_path = $source_dir . '/' . $file;
            $target_path = $target_dirs[$type] . '/' . $file;

            echo "Copying: $file\n";
            if (copy($source_path, $target_path)) {
                chmod($target_path, 0666);
                $fileCount++;
                echo "Successfully copied\n";
            } else {
                echo "Failed to copy: " . error_get_last()['message'] . "\n";
            }
        }

        echo "Copied $fileCount files from $type directory\n\n";
    }

    // Update database paths for pets
    echo "Updating database paths...\n";
    $query = "SELECT id, photo FROM pets WHERE photo IS NOT NULL";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        echo "Query failed: " . mysqli_error($conn) . "\n";
        exit;
    }
    
    $count = mysqli_num_rows($result);
    echo "Found $count pets with photos to update\n\n";
    
    while ($row = mysqli_fetch_assoc($result)) {
        echo "Processing Pet ID: {$row['id']}\n";
        echo "Old path: {$row['photo']}\n";
        
        if ($row['photo']) {
            $filename = basename($row['photo']);
            $new_path = 'uploads/pet_photos/' . $filename;
            
            // Update database with new path
            $update = "UPDATE pets SET photo = ? WHERE id = ?";
            $stmt = mysqli_prepare($conn, $update);
            mysqli_stmt_bind_param($stmt, "si", $new_path, $row['id']);
            
            if (mysqli_stmt_execute($stmt)) {
                echo "Updated to: $new_path\n";
            } else {
                echo "Failed to update database: " . mysqli_error($conn) . "\n";
            }
        }
        echo "\n";
    }
    
    echo "Process completed!\n";
    echo "All files have been copied and database has been updated.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    error_log("Copy files error: " . $e->getMessage());
} 