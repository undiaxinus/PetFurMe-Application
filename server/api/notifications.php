<?php
require_once '../config/Database.php';

header('Content-Type: application/json');

// Get all notifications for the current user
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = $_SESSION['user_id']; // Assuming you have user authentication
    
    $database = new Database();
    $conn = $database->connect();
    
    $query = "SELECT * FROM notifications 
              WHERE user_id = ? 
              ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = array();
    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;
    }
    
    echo json_encode($notifications);
}

// Mark notification as read
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])) {
    try {
        $notification_id = $_GET['id'];
        $user_id = $_SESSION['user_id'];
        
        $database = new Database();
        $conn = $database->connect();
        
        $query = "UPDATE notifications 
                  SET read_at = CURRENT_TIMESTAMP 
                  WHERE id = ? AND user_id = ?";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("si", $notification_id, $user_id);
        $success = $stmt->execute();
        
        if ($success) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to mark notification as read']);
        }
    } finally {
        if (isset($stmt)) {
            $stmt->close();
        }
        if (isset($conn)) {
            $conn->close();
        }
    }
}
?> 