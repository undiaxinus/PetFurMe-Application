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

    // Get date from query parameter
    $date = isset($_GET['date']) ? $_GET['date'] : null;

    if (!$date) {
        throw new Exception("Date is required");
    }

    // Count appointments for the given date
    $query = "SELECT COUNT(*) as appointment_count 
              FROM appointment 
              WHERE appointment_date = ?";
             
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    $stmt->bind_param("s", $date);
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $appointment_count = $row['appointment_count'];
        
        $available_slots = 10 - $appointment_count;
        
        $stmt->close();
        
        echo json_encode(array(
            'success' => true,
            'available_slots' => $available_slots,
            'is_available' => $available_slots > 0
        ));
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
} catch(Exception $e) {
    error_log("Error in check_availability.php: " . $e->getMessage());
    echo json_encode(array(
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ));
}
?> 