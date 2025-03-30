<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get user_id from query parameter
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

    if (!$user_id) {
        throw new Exception("User ID is required");
    }

    // Query to get appointments
    $query = "SELECT * FROM appointment 
              WHERE user_id = ? 
              AND (deleted_at IS NULL)
              ORDER BY appointment_date DESC, appointment_time DESC";
             
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    $stmt->bind_param("s", $user_id);
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $appointments = array();
        
        while ($row = $result->fetch_assoc()) {
            $appointments[] = $row;
        }
        
        $stmt->close();
        
        echo json_encode($appointments);
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
} catch(Exception $e) {
    error_log("Error in get_appointments.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        'error' => 'Failed to fetch appointments',
        'details' => $e->getMessage()
    ));
}
?> 