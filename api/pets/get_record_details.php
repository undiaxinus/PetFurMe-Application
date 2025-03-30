<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
// require_once '../middlewares/auth.php';
$database = new Database();
$conn = $database->connect();

// Get record type and ID from request
$record_type = isset($_GET['record_type']) ? $_GET['record_type'] : null;
$record_id = isset($_GET['record_id']) ? $_GET['record_id'] : null;

if (!$record_type || !$record_id) {
    echo json_encode([
        "success" => false,
        "message" => "Record type and Record ID are required"
    ]);
    exit;
}

try {
    if ($record_type === 'medical') {
        // Get medical findings details
        $query = "
        SELECT 
            f.id,
            f.appointment_id,
            f.pet_id,
            p.name AS pet_name,
            p.type AS pet_type,
            a.appointment_date,
            f.findings_data,
            f.additional_notes,
            f.recommendations,
            f.diagnosis,
            f.treatment_plan,
            f.follow_up_date,
            f.status,
            f.created_at,
            u.name AS created_by_name
        FROM findings f
        JOIN appointment a ON f.appointment_id = a.id
        JOIN pets p ON f.pet_id = p.id
        JOIN users u ON f.created_by = u.id
        WHERE f.id = ?";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $record_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $record = $result->fetch_assoc();
        
        if ($record) {
            // Try to decode findings_data JSON
            $findings_data = json_decode($record['findings_data'], true);
            
            // If it's still a string (json within json), try decoding again
            if (is_string($findings_data)) {
                $findings_data = json_decode($findings_data, true);
            }
            
            $record['findings_data'] = $findings_data;
            
            echo json_encode([
                "success" => true,
                "record" => $record
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Medical record not found"
            ]);
        }
    } elseif ($record_type === 'financial') {
        // Get charge slip details
        $query = "
        SELECT 
            cs.*,
            a.appointment_date,
            p.name AS pet_name,
            p.type AS pet_type
        FROM charge_slips cs
        JOIN appointment a ON cs.appointment_id = a.id
        JOIN pets p ON a.pet_id = p.id
        WHERE cs.id = ?";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $record_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $record = $result->fetch_assoc();
        
        if ($record) {
            // Decode services and products JSON
            $record['services'] = json_decode($record['services'], true);
            $record['products'] = json_decode($record['products'], true);
            
            echo json_encode([
                "success" => true,
                "record" => $record
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Financial record not found"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Invalid record type"
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?> 