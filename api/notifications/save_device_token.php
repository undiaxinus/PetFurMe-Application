<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

$response = array();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id']) || !isset($data['device_token'])) {
        throw new Exception('Missing required fields');
    }

    $user_id = $data['user_id'];
    $device_token = $data['device_token'];

    $database = new Database();
    $conn = $database->connect();

    // Check if token already exists
    $query = "SELECT id FROM device_tokens WHERE user_id = ? AND token = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("is", $user_id, $device_token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        // Insert new token
        $query = "INSERT INTO device_tokens (user_id, token, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("is", $user_id, $device_token);
        $stmt->execute();
    }

    $response['success'] = true;
    $response['message'] = 'Device token saved successfully';

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}

echo json_encode($response); 