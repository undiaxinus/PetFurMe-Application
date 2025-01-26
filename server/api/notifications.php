<?php
require_once '../config/database.php';

header('Content-Type: application/json');

// Get all notifications for the current user
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = $_SESSION['user_id']; // Assuming you have user authentication
    
    $query = "SELECT * FROM notifications 
              WHERE user_id = ? 
              ORDER BY created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$user_id]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($notifications);
}

// Mark notification as read
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])) {
    $notification_id = $_GET['id'];
    $user_id = $_SESSION['user_id'];
    
    $query = "UPDATE notifications 
              SET read_at = CURRENT_TIMESTAMP 
              WHERE id = ? AND user_id = ?";
    
    $stmt = $pdo->prepare($query);
    $result = $stmt->execute([$notification_id, $user_id]);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to mark notification as read']);
    }
}
?> 