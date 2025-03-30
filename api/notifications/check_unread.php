<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

$response = array();

try {
    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }

    $user_id = $_GET['user_id'];
    
    $database = new Database();
    $conn = $database->connect();

    // Check for unread notifications
    $query = "SELECT COUNT(*) as unread_count 
              FROM notifications 
              WHERE user_id = ? 
              AND read_at IS NULL";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to check unread notifications');
    }
    
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    $response['success'] = true;
    $response['hasUnread'] = $row['unread_count'] > 0;

} catch (Exception $e) {
    error_log("Error in check_unread.php: " . $e->getMessage());
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