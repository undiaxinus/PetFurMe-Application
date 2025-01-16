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
              (user_id, pet_id, pet_name, owner_name, reason_for_visit, other_reason, 
               appointment_date, appointment_time, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    // Get other_reason value
    $other_reason = ($data->reason_for_visit === "Other" && isset($data->other_reason)) ? 
                    $data->other_reason : null;

    // Bind parameters
    $stmt->bind_param(
        "iissssss",
        $data->user_id,
        $data->pet_id,
        $data->pet_name,
        $data->owner_name,
        $data->reason_for_visit,
        $other_reason,
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