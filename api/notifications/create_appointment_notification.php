<?php
require_once __DIR__ . '/../config/Database.php';

function createAppointmentNotification($user_id, $appointment_id, $status, $appointment_data) {
    try {
        $database = new Database();
        $conn = $database->connect();

        // Prepare notification data
        $type = 'appointment_' . $status;
        $notifiable_type = 'appointment';
        $message = '';
        
        switch($status) {
            case 'confirmed':
                $message = "Your appointment for " . $appointment_data['pet_name'] . " on " . 
                          date('M d, Y', strtotime($appointment_data['appointment_date'])) . 
                          " at " . date('h:i A', strtotime($appointment_data['appointment_time'])) . 
                          " has been confirmed.";
                break;
            // Add other status cases as needed
        }

        $data = json_encode([
            'message' => $message,
            'appointment_id' => $appointment_id
        ]);

        // Insert notification
        $query = "INSERT INTO notifications (
            user_id, 
            type, 
            notifiable_type, 
            notifiable_id, 
            data, 
            created_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("issss", 
            $user_id, 
            $type, 
            $notifiable_type, 
            $appointment_id, 
            $data
        );

        if (!$stmt->execute()) {
            throw new Exception('Failed to create notification: ' . $stmt->error);
        }

        return [
            'success' => true,
            'notification_id' => $conn->insert_id
        ];

    } catch (Exception $e) {
        error_log("Error creating appointment notification: " . $e->getMessage());
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