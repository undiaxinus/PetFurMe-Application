<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'appointment_errors.log');

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get posted data
    $rawData = file_get_contents("php://input");
    error_log("Raw data received: " . $rawData);
    
    $data = json_decode($rawData);
    
    if ($data === null) {
        throw new Exception("JSON decode error: " . json_last_error_msg());
    }

    // Validate required fields
    if (!isset($data->user_id) || !isset($data->owner_name) || !isset($data->reason_for_visit) || 
        !isset($data->appointment_date) || !isset($data->appointment_time) || 
        !isset($data->pet_id) || !isset($data->pet_name)) {
        throw new Exception("Missing required fields");
    }

    // Check if there are available slots
    $check_query = "SELECT COUNT(*) as appointment_count 
                    FROM appointment 
                    WHERE appointment_date = ?";
             
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bind_param("s", $data->appointment_date);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $row = $result->fetch_assoc();
    $appointment_count = $row['appointment_count'];
    $check_stmt->close();

    if ($appointment_count >= 10) {
        throw new Exception("This date is fully booked. Please select another date.");
    }

    // Prepare the query
    $query = "INSERT INTO appointment 
              (user_id, pet_id, pet_name, owner_name, reason_for_visit, 
               consultation_types, other_consultation_reason, vaccination_types, 
               other_vaccination_type, other_reason, appointment_date, appointment_time, status) 
              VALUES 
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    $status = 'Pending';
    
    // Bind parameters - fixed parameter count to match the query
    $stmt->bind_param("iisssssssssss",
        $data->user_id,
        $data->pet_id,
        $data->pet_name,
        $data->owner_name,
        $data->reason_for_visit,
        $data->consultation_types,
        $data->other_consultation_reason,
        $data->vaccination_types,
        $data->other_vaccination_type,
        $data->other_reason,
        $data->appointment_date,
        $data->appointment_time,
        $status
    );

    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $appointment_id = $db->insert_id;
    $stmt->close();
    
    echo json_encode(array(
        'success' => true,
        'message' => 'Appointment saved successfully',
        'appointment_id' => $appointment_id
    ));
    
} catch(Exception $e) {
    error_log("Appointment Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'message' => $e->getMessage()
    ));
}
?> 