<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$response = array();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Invalid request method');
    }

    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }

    $user_id = $_GET['user_id'];
    
    // Log the request
    error_log("Fetching notifications for user_id: " . $user_id);

    // Create database connection
    $database = new Database();
    $conn = $database->connect();

    // Log connection status
    error_log("Database connection established");

    $query = "SELECT id, type, notifiable_type, data, read_at, created_at 
              FROM notifications 
              WHERE user_id = ? 
              ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        throw new Exception('Failed to prepare statement');
    }
    
    $stmt->bind_param("i", $user_id);
    
    if (!$stmt->execute()) {
        error_log("Execute failed: " . $stmt->error);
        throw new Exception('Failed to execute query');
    }
    
    $result = $stmt->get_result();
    $notifications = array();
    
    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;
    }
    
    // Log the results
    error_log("Found " . count($notifications) . " notifications");
    
    $response['success'] = true;
    $response['notifications'] = $notifications;

} catch (Exception $e) {
    error_log("Error in get_notifications.php: " . $e->getMessage());
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