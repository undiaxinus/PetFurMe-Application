<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

try {
    $database = new Database();
    $conn = $database->connect();

    $query = "SELECT id, name, email FROM users WHERE role IN ('admin', 'sub_admin')";
    $stmt = $conn->prepare($query);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to fetch admins');
    }

    $result = $stmt->get_result();
    $admins = [];
    
    while ($row = $result->fetch_assoc()) {
        $admins[] = $row;
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