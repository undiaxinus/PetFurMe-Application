<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

error_log("Starting get_admins.php");

try {
    $database = new Database();
    $conn = $database->connect();

    if (!$conn) {
        error_log("Database connection failed in get_admins.php");
        throw new Exception("Database connection failed");
    }

    // Test connection
    if (!$conn->ping()) {
        error_log("Database connection lost in get_admins.php");
        throw new Exception("Database connection lost");
    }

    $query = "SELECT id, name, role, last_activity 
              FROM users 
              WHERE role IN ('admin', 'sub_admin') 
                AND deleted_at IS NULL";
              
    error_log("Executing admin query: " . $query);
    
    // Test if the users table exists
    $test_query = "SHOW TABLES LIKE 'users'";
    $test_result = $conn->query($test_query);
    if (!$test_result || $test_result->num_rows === 0) {
        error_log("Users table not found");
        throw new Exception("Database structure error");
    }

    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        throw new Exception('Failed to prepare admin query');
    }

    if (!$stmt->execute()) {
        error_log("Execute failed: " . $stmt->error);
        throw new Exception('Failed to execute admin query');
    }

    $result = $stmt->get_result();
    error_log("Found " . $result->num_rows . " admins");
    
    $admins = [];
    while ($row = $result->fetch_assoc()) {
        $admins[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'role' => $row['role'],
            'last_activity' => $row['last_activity']
        ];
    }

    if (empty($admins)) {
        error_log("No administrators found in database");
        throw new Exception('No administrators available');
    }

    echo json_encode([
        'success' => true,
        'admins' => $admins,
        'count' => count($admins)
    ]);

} catch (Exception $e) {
    error_log("Error in get_admins.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_details' => error_get_last()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
} 