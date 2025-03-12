<?php
header('Content-Type: image/jpeg');
require_once '../config/Database.php';

try {
    $user_id = $_GET['user_id'] ?? null;
    if (!$user_id) {
        throw new Exception('User ID is required');
    }

    $database = new Database();
    $db = $database->connect();
    
    $stmt = $db->prepare("SELECT photo FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        if ($row['photo']) {
            echo $row['photo'];
        } else {
            // Return a default image or 404
            header("HTTP/1.0 404 Not Found");
        }
    }
} catch (Exception $e) {
    error_log("Error in get_user_photo: " . $e->getMessage());
    header("HTTP/1.0 404 Not Found");
}
?> 