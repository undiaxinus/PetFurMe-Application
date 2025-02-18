<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $data['user_id'] ?? null;
    
    if (!$user_id) {
        throw new Exception('User ID is required');
    }
    
    // Update complete_credentials
    $query = "UPDATE users SET complete_credentials = 1 WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param("i", $user_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Profile marked as complete'
        ]);
    } else {
        throw new Exception('Failed to update profile status');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($db)) $db->close();
}
?> 