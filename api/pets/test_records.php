<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';
$database = new Database();
$conn = $database->connect();

// Check database connection
try {
    // Test findings table
    $findingsQuery = "SELECT COUNT(*) AS count FROM findings";
    $findingsStmt = $conn->prepare($findingsQuery);
    $findingsStmt->execute();
    $findingsResult = $findingsStmt->get_result();
    $findingsCount = $findingsResult->fetch_assoc()['count'];
    
    // Test charge_slips table
    $chargeSlipsQuery = "SELECT COUNT(*) AS count FROM charge_slips";
    $chargeSlipsStmt = $conn->prepare($chargeSlipsQuery);
    $chargeSlipsStmt->execute();
    $chargeSlipsResult = $chargeSlipsStmt->get_result();
    $chargeSlipsCount = $chargeSlipsResult->fetch_assoc()['count'];
    
    // Test appointment table
    $appointmentQuery = "SELECT COUNT(*) AS count FROM appointment";
    $appointmentStmt = $conn->prepare($appointmentQuery);
    $appointmentStmt->execute();
    $appointmentResult = $appointmentStmt->get_result();
    $appointmentCount = $appointmentResult->fetch_assoc()['count'];
    
    echo json_encode([
        "success" => true,
        "message" => "Database connection successful",
        "data" => [
            "findings_count" => $findingsCount,
            "charge_slips_count" => $chargeSlipsCount,
            "appointment_count" => $appointmentCount
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
}
?> 