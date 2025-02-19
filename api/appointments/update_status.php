<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/Database.php';
include_once '../models/Appointment.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get posted data
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->appointment_id) || !isset($data->status)) {
        throw new Exception('Missing required fields');
    }

    // Validate status is one of the allowed values
    $allowed_statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
    if (!in_array($data->status, $allowed_statuses)) {
        throw new Exception('Invalid status value');
    }

    // Update appointment status
    $query = "UPDATE appointment 
              SET status = ?,
                  updated_at = NOW()
              WHERE id = ?";

    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    // Bind parameters
    $stmt->bind_param("si", $data->status, $data->appointment_id);

    // Execute query
    if ($stmt->execute()) {
        // Check if any rows were affected
        if ($stmt->affected_rows > 0) {
            echo json_encode(array(
                'success' => true,
                'message' => 'Appointment status updated successfully'
            ));
        } else {
            throw new Exception('Appointment not found or no changes made');
        }
    } else {
        throw new Exception('Failed to update appointment status: ' . $stmt->error);
    }

} catch(Exception $e) {
    error_log("Error in update_status.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'message' => $e->getMessage()
    ));
}
?> 