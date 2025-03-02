<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

try {
    $database = new Database();
    $conn = $database->connect();

    // Get active admins and sub-admins, ordered by last_activity
    $query = "SELECT id, name, role, last_activity 
              FROM users 
              WHERE role IN ('admin', 'sub_admin') 
                AND deleted_at IS NULL 
              ORDER BY last_activity DESC 
              LIMIT 1";
              
    $stmt = $conn->prepare($query);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to fetch admins');
    }

    $result = $stmt->get_result();
    $admins = [];
    
    while ($row = $result->fetch_assoc()) {
        $admins[] = $row;
    }

    if (empty($admins)) {
        throw new Exception('No administrators available');
    }

    echo json_encode([
        'success' => true,
        'admins' => $admins
    ]);

} catch (Exception $e) {
    error_log("Error in get_admins.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
} 