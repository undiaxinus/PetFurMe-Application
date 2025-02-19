<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../config/Database.php';
include_once '../models/Appointment.php';

$database = new Database();
$db = $database->connect();

$appointment = new Appointment($db);

$data = json_decode(file_get_contents("php://input"));

try {
    // Update the status of the original appointment to 'rescheduled'
    $appointment->updateStatus($data->original_appointment_id, 'rescheduled');
    
    // Create the new appointment
    $appointment->user_id = $data->user_id;
    $appointment->pet_id = $data->pet_id;
    $appointment->pet_name = $data->pet_name;
    $appointment->pet_type = $data->pet_type;
    $appointment->pet_age = $data->pet_age;
    $appointment->reason_for_visit = $data->reason_for_visit;
    $appointment->appointment_date = $data->appointment_date;
    $appointment->appointment_time = $data->appointment_time;
    $appointment->status = 'pending';

    if($appointment->create()) {
        echo json_encode(array(
            'success' => true,
            'message' => 'Appointment rescheduled successfully',
            'appointment_id' => $appointment->id
        ));
    } else {
        throw new Exception('Failed to create new appointment');
    }
} catch(Exception $e) {
    echo json_encode(array(
        'success' => false,
        'message' => $e->getMessage()
    ));
}
?> 