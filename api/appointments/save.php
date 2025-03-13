<?php
// Update error logging configuration
error_reporting(E_ALL);
ini_set('display_errors', 0); // Change to 0 for production
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/appointments.log');

// Add debug flag similar to get_upcoming.php
define('DEBUG_ENABLED', false);

// Add additional headers for debugging
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/Database.php';

try {
    // Only log detailed request info when debugging
    if (DEBUG_ENABLED) {
        error_log("=== New Appointment Request ===");
        error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
    }
    
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get raw data
    $rawData = file_get_contents("php://input");
    
    // Only log raw data when debugging is enabled
    if (DEBUG_ENABLED) {
        error_log("Raw request data: " . $rawData);
    }
    
    // Parse JSON
    $data = json_decode($rawData);
    
    if ($data === null) {
        throw new Exception("JSON decode error: " . json_last_error_msg());
    }

    // Validate required fields and their types
    $required_fields = [
        'user_id' => 'integer',
        'pet_id' => 'integer',
        'pet_name' => 'string',
        'pet_type' => 'string',
        'pet_age' => 'integer',
        'reason_for_visit' => 'string',
        'appointment_date' => 'string',
        'appointment_time' => 'string'
    ];

    $missing_fields = [];
    $invalid_types = [];

    foreach ($required_fields as $field => $type) {
        if (!isset($data->$field)) {
            $missing_fields[] = $field;
            continue;
        }

        // Type validation
        switch ($type) {
            case 'integer':
                if (!is_numeric($data->$field)) {
                    $invalid_types[] = "$field (should be number)";
                }
                break;
            case 'string':
                if (!is_string($data->$field)) {
                    $invalid_types[] = "$field (should be text)";
                }
                break;
        }
    }

    if (!empty($missing_fields)) {
        $error_details = array(
            'message' => "Missing required fields",
            'missing_fields' => $missing_fields,
            'received_data' => $data
        );
        error_log("Validation Error: " . json_encode($error_details));
        throw new Exception(json_encode($error_details));
    }

    if (!empty($invalid_types)) {
        $error_details = array(
            'message' => "Invalid field types",
            'invalid_fields' => $invalid_types,
            'received_data' => array(
                'user_id' => ['value' => $data->user_id ?? null, 'type' => gettype($data->user_id ?? null)],
                'pet_id' => ['value' => $data->pet_id ?? null, 'type' => gettype($data->pet_id ?? null)],
                'pet_name' => ['value' => $data->pet_name ?? null, 'type' => gettype($data->pet_name ?? null)],
                'pet_type' => ['value' => $data->pet_type ?? null, 'type' => gettype($data->pet_type ?? null)],
                'pet_age' => ['value' => $data->pet_age ?? null, 'type' => gettype($data->pet_age ?? null)],
                'reason_for_visit' => ['value' => $data->reason_for_visit ?? null, 'type' => gettype($data->reason_for_visit ?? null)],
                'appointment_date' => ['value' => $data->appointment_date ?? null, 'type' => gettype($data->appointment_date ?? null)],
                'appointment_time' => ['value' => $data->appointment_time ?? null, 'type' => gettype($data->appointment_time ?? null)]
            )
        );
        error_log("Validation Error: " . json_encode($error_details));
        throw new Exception(json_encode($error_details));
    }

    // Convert fields to appropriate types
    $data->user_id = (int)$data->user_id;
    $data->pet_id = (int)$data->pet_id;
    $data->pet_age = (int)$data->pet_age;

    // Validate date and time format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data->appointment_date)) {
        throw new Exception("Invalid date format. Use YYYY-MM-DD");
    }

    if (!preg_match('/^\d{2}:\d{2}$/', $data->appointment_time)) {
        throw new Exception("Invalid time format. Use HH:mm");
    }

    // Prepare the query with only necessary fields
    $query = "INSERT INTO appointment (
        user_id, 
        pet_id, 
        pet_name, 
        pet_type, 
        pet_age,
        reason_for_visit,
        appointment_date,
        appointment_time,
        status,
        notes,
        created_by_type,
        created_by_id,
        created_at,
        updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

    // Reduce query logging
    if (DEBUG_ENABLED) {
        error_log("Preparing query: " . $query);
        error_log("Executing statement...");
    }
    
    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    $status = 'pending';
    $notes = '';
    $created_by_type = 'user';
    
    // Bind parameters with correct types
    $result = $stmt->bind_param("iississssssi",
        $data->user_id,
        $data->pet_id,
        $data->pet_name,
        $data->pet_type,
        $data->pet_age,
        $data->reason_for_visit,
        $data->appointment_date,
        $data->appointment_time,
        $status,
        $notes,
        $created_by_type,
        $data->user_id  // created_by_id same as user_id
    );

    if (!$result) {
        throw new Exception("Bind failed: " . $stmt->error);
    }

    // Make this conditional
    if (DEBUG_ENABLED) {
        error_log("Executing statement...");
    }
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $appointment_id = $db->insert_id;
    $stmt->close();
    
    $response = array(
        'success' => true,
        'message' => 'Appointment saved successfully',
        'appointment_id' => $appointment_id
    );
    
    // Success response
    if (DEBUG_ENABLED) {
        error_log("Success response: " . json_encode($response));
    }
    echo json_encode($response);
    
} catch(Exception $e) {
    error_log("ERROR: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Try to parse the error message if it's JSON
    $message = $e->getMessage();
    $decoded_message = json_decode($message);
    
    $error_response = array(
        'success' => false,
        'message' => $decoded_message ? $message : 'Error: ' . $message
    );
    
    error_log("Sending error response: " . json_encode($error_response));
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($error_response);
}
?> 