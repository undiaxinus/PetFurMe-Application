<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/Database.php';
// We don't need auth middleware if it's causing issues
// require_once '../middlewares/auth.php';
$database = new Database();
$conn = $database->connect();

// Get the user ID from the request
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!$user_id) {
    echo json_encode([
        "success" => false,
        "message" => "User ID is required"
    ]);
    exit;
}

try {
    // First, get all relevant appointments
    $appointmentsQuery = "
    SELECT 
        a.id AS appointment_id,
        a.pet_id,
        p.name AS pet_name,
        a.appointment_date,
        a.reason_for_visit
    FROM appointment a
    JOIN pets p ON a.pet_id = p.id
    WHERE a.user_id = ?
    ORDER BY a.appointment_date DESC
    LIMIT 15";
    
    $stmt = $conn->prepare($appointmentsQuery);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $appointmentsResult = $stmt->get_result();
    
    $appointments = [];
    while ($row = $appointmentsResult->fetch_assoc()) {
        $appointments[$row['appointment_id']] = [
            'appointment_id' => $row['appointment_id'],
            'pet_id' => $row['pet_id'],
            'pet_name' => $row['pet_name'],
            'date' => $row['appointment_date'],
            'reason' => json_decode($row['reason_for_visit'], true),
            'medical' => null,
            'financial' => null
        ];
    }
    
    // If we have no appointments, return empty array
    if (empty($appointments)) {
        echo json_encode([
            "success" => true,
            "records" => []
        ]);
        exit;
    }
    
    // Get appointment IDs as a comma-separated string for the IN clause
    $appointmentIds = implode(',', array_keys($appointments));
    
    // Get findings for these appointments
    $findingsQuery = "
    SELECT 
        f.id,
        f.appointment_id,
        f.findings_data,
        f.diagnosis,
        f.recommendations
    FROM findings f
    WHERE f.appointment_id IN ($appointmentIds)";
    
    $findingsStmt = $conn->prepare($findingsQuery);
    $findingsStmt->execute();
    $findingsResult = $findingsStmt->get_result();
    
    while ($finding = $findingsResult->fetch_assoc()) {
        $appId = $finding['appointment_id'];
        if (isset($appointments[$appId])) {
            // Try to decode findings_data
            $findingsData = json_decode($finding['findings_data'], true);
            // Double decode if needed (string within JSON)
            if (is_string($findingsData)) {
                $findingsData = json_decode($findingsData, true);
            }
            
            $description = "Medical Record";
            if (is_array($findingsData)) {
                if (isset($findingsData['vaccination_type'])) {
                    $description = "Vaccination: " . $findingsData['vaccination_type'];
                } elseif (isset($findingsData['diagnosis'])) {
                    $description = "Diagnosis: " . $findingsData['diagnosis'];
                } elseif (isset($findingsData['procedure'])) {
                    $description = "Procedure: " . $findingsData['procedure'];
                } else if ($finding['diagnosis']) {
                    $description = "Diagnosis: " . $finding['diagnosis'];
                }
            }
            
            $appointments[$appId]['medical'] = [
                'id' => $finding['id'],
                'type' => 'Finding',
                'description' => $description,
                'details' => $finding['recommendations'] ? "Recommendations: " . $finding['recommendations'] : "",
                'data' => $findingsData
            ];
        }
    }
    
    // Get charge slips for these appointments
    $chargeSlipsQuery = "
    SELECT 
        cs.id,
        cs.appointment_id,
        cs.invoice_number,
        cs.services_total,
        cs.products_total,
        cs.grand_total,
        cs.services,
        cs.products
    FROM charge_slips cs
    WHERE cs.appointment_id IN ($appointmentIds)";
    
    $chargeSlipsStmt = $conn->prepare($chargeSlipsQuery);
    $chargeSlipsStmt->execute();
    $chargeSlipsResult = $chargeSlipsStmt->get_result();
    
    while ($chargeSlip = $chargeSlipsResult->fetch_assoc()) {
        $appId = $chargeSlip['appointment_id'];
        if (isset($appointments[$appId])) {
            $appointments[$appId]['financial'] = [
                'id' => $chargeSlip['id'],
                'type' => 'Charge Slip',
                'description' => 'Payment Receipt',
                'details' => "Invoice #" . $chargeSlip['invoice_number'] . " - Total: $" . $chargeSlip['grand_total'],
                'data' => [
                    'invoice_number' => $chargeSlip['invoice_number'],
                    'services_total' => $chargeSlip['services_total'],
                    'products_total' => $chargeSlip['products_total'],
                    'grand_total' => $chargeSlip['grand_total'],
                    'services' => json_decode($chargeSlip['services'], true),
                    'products' => json_decode($chargeSlip['products'], true)
                ]
            ];
        }
    }
    
    // Convert appointments to records array
    $records = [];
    foreach ($appointments as $appointment) {
        // Only add appointments that have either medical or financial records
        if ($appointment['medical'] !== null || $appointment['financial'] !== null) {
            $records[] = [
                'appointment_id' => $appointment['appointment_id'],
                'pet_id' => $appointment['pet_id'],
                'pet_name' => $appointment['pet_name'],
                'date' => $appointment['date'],
                'reason' => $appointment['reason'],
                'medical' => $appointment['medical'],
                'financial' => $appointment['financial'],
                'has_both' => ($appointment['medical'] !== null && $appointment['financial'] !== null)
            ];
        }
    }
    
    echo json_encode([
        "success" => true,
        "records" => $records
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?> 