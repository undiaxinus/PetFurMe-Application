<?php
require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $conn = $database->connect();
    
    if ($conn) {
        echo "Database connection successful!\n";
        
        // Test query
        $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM pets");
        $row = mysqli_fetch_assoc($result);
        echo "Number of pets in database: " . $row['count'] . "\n";
    } else {
        echo "Failed to connect to database\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 