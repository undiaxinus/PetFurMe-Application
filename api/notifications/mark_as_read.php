<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

$response = array();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['notification_id']) || !isset($data['user_id'])) {
        throw new Exception('Missing required fields');
    }

    $notification_id = $data['notification_id'];
    $user_id = $data['user_id'];

    $database = new Database();
    $conn = $database->connect();

    // First verify the notification belongs to the user
    $verify_query = "SELECT id FROM notifications WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($verify_query);
    $stmt->bind_param("si", $notification_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Notification not found or unauthorized');
    }

    // Update the notification as read
    $update_query = "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ?";
    $stmt = $conn->prepare($update_query);
    $stmt->bind_param("s", $notification_id);
    
    if (!$stmt->execute()) {
        error_log("MySQL Error: " . $stmt->error);
        throw new Exception('Failed to update notification');
    }

    if ($stmt->affected_rows === 0) {
        throw new Exception('No notification was updated');
    }

    $response['success'] = true;
    $response['message'] = 'Notification marked as read successfully';

} catch (Exception $e) {
    error_log("Error in mark_as_read.php: " . $e->getMessage());
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