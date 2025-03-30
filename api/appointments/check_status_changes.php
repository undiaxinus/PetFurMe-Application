<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../notifications/create_appointment_notification.php';

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
    
    $database = new Database();
    $conn = $database->connect();

    // Get appointments that were recently confirmed but don't have notifications yet
    $query = "SELECT a.* 
              FROM appointment a 
              LEFT JOIN notifications n ON 
                n.notifiable_id = a.id AND 
                n.type = 'appointment_confirmed' AND 
                n.user_id = a.user_id
              WHERE a.user_id = ? 
              AND a.status = 'confirmed' 
              AND n.id IS NULL";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to check appointment status');
    }
    
    $result = $stmt->get_result();
    $newNotifications = [];
    
    while ($appointment = $result->fetch_assoc()) {
        // Create notification for each newly confirmed appointment
        $notificationResult = createAppointmentNotification(
            $user_id,
            $appointment['id'],
            'confirmed',
            $appointment
        );
        
        if ($notificationResult['success']) {
            $newNotifications[] = $notificationResult['notification_id'];
        }
    }
    
    $response['success'] = true;
    $response['new_notifications'] = count($newNotifications);
    $response['notification_ids'] = $newNotifications;

} catch (Exception $e) {
    error_log("Error in check_status_changes.php: " . $e->getMessage());
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