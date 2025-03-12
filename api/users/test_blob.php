<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include '../config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    // Test connection
    if (!$db->ping()) {
        throw new Exception("Database connection failed");
    }
    
    // Test BLOB column
    $test_data = base64_decode('/9j/4AAQSkZJRg=='); // Small valid JPEG header
    $stmt = $db->prepare("UPDATE users SET photo = ? WHERE id = 1 LIMIT 1");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }
    
    $stmt->bind_param("b", $test_data);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'BLOB test successful'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 