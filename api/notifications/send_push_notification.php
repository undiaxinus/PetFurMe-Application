<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

function sendPushNotification($user_id, $title, $message) {
    // Log notification attempt
    error_log("Attempting to send push notification to user: " . $user_id);
    
    try {
        // Create database connection
        $database = new Database();
        $conn = $database->connect();

        // Insert notification into database
        $query = "INSERT INTO notifications (user_id, type, data, created_at) 
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP)";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iss", $user_id, $title, $message);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to save notification');
        }

        // Get the notification ID
        $notification_id = $stmt->insert_id;

        return [
            'success' => true,
            'notification_id' => $notification_id,
            'message' => 'Notification sent successfully'
        ];

    } catch (Exception $e) {
        error_log("Error sending push notification: " . $e->getMessage());
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    } finally {
        if (isset($stmt)) {
            $stmt->close();
        }
        if (isset($conn)) {
            $conn->close();
        }
    }
} 