<?php
header('Content-Type: text/plain');

$project_root = __DIR__ . '/../../';
$pet_photos_dir = $project_root . '/uploads/pet_photos';

echo "Verifying extracted files in: $pet_photos_dir\n\n";

if (file_exists($pet_photos_dir)) {
    $files = scandir($pet_photos_dir);
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            $full_path = $pet_photos_dir . '/' . $file;
            echo "File: $file\n";
            echo "Size: " . filesize($full_path) . " bytes\n";
            echo "Last modified: " . date("Y-m-d H:i:s", filemtime($full_path)) . "\n\n";
        }
    }
} else {
    echo "Directory not found: $pet_photos_dir";
} 