<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

include_once '../config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields
    if (!isset($data->user_id) || !isset($data->owner_name) || !isset($data->reason_for_visit) || 
        !isset($data->appointment_date) || !isset($data->appointment_time)) {
        throw new Exception("Missing required fields");
    }

    // Prepare the query
    $query = "INSERT INTO appointment 
              (user_id, owner_name, reason_for_visit, appointment_date, appointment_time, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
    
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    // Bind parameters
    $stmt->bind_param(
        "issss",
        $data->user_id,
        $data->owner_name,
        $data->reason_for_visit,
        $data->appointment_date,
        $data->appointment_time
    );

    if($stmt->execute()) {
        $appointment_id = $db->insert_id;
        $stmt->close();
        
        echo json_encode(array(
            'success' => true,
            'message' => 'Appointment saved successfully',
            'appointment_id' => $appointment_id
        ));
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
} catch(Exception $e) {
    error_log("Database Error: " . $e->getMessage());
    echo json_encode(array(
        'success' => false,
        'message' => 'Database Error: ' . $e->getMessage()
    ));
}
?> 