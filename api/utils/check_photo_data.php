<?php
header('Content-Type: text/plain');

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $conn = $database->connect();
    
    $query = "SELECT id, photo, photo_data FROM pets WHERE photo_data IS NOT NULL";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        echo "Query failed: " . mysqli_error($conn) . "\n";
        exit;
    }
    
    $count = mysqli_num_rows($result);
    echo "Found $count pets with photo data\n\n";
    
    while ($row = mysqli_fetch_assoc($result)) {
        echo "Pet ID: {$row['id']}\n";
        echo "Has photo path: " . (!empty($row['photo']) ? "Yes - {$row['photo']}" : "No") . "\n";
        echo "Has photo data: " . (!empty($row['photo_data']) ? "Yes (" . strlen($row['photo_data']) . " bytes)" : "No") . "\n\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 