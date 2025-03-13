<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../config/Database.php';
include_once '../models/Appointment.php';

// Create database connection
$database = new Database();
$db = $database->connect();

// Initialize appointment object with database connection
$appointment = new Appointment($db);

$data = json_decode(file_get_contents("php://input"));

try {
    // Validate required fields
    if (!isset($data->original_appointment_id) || !isset($data->pet_id) || 
        !isset($data->appointment_date) || !isset($data->appointment_time)) {
        throw new Exception('Missing required fields for rescheduling');
    }
    
    // Update the appointment with new details instead of creating a new one
    $originalId = $data->original_appointment_id;
    
    if ($appointment->updateAppointment($originalId, $data)) {
        echo json_encode(array(
            'success' => true,
            'message' => 'Appointment rescheduled successfully',
            'appointment_id' => $originalId
        ));
    } else {
        throw new Exception('Failed to reschedule appointment');
    }
} catch(Exception $e) {
    echo json_encode(array(
        'success' => false,
        'message' => $e->getMessage()
    ));
}
?> 