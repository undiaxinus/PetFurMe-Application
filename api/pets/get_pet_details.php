<?php
// Start output buffering and error logging
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/pet_details_error.log');

// Log request details
error_log("Pet details script started");
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("GET params: " . json_encode($_GET));

// Set headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/Database.php';

try {
    if (!isset($_GET['pet_id'])) {
        throw new Exception("Pet ID is required");
    }

    $pet_id = $_GET['pet_id'];
    error_log("Processing request for pet_id: " . $pet_id);

    // Create database connection
    $database = new Database();
    $conn = $database->connect();
    
    if (!$conn) {
        error_log("Database connection failed: " . mysqli_connect_error());
        throw new Exception("Database connection failed");
    }

    error_log("Database connection successful");

    // Prepare and execute query using mysqli
    $query = "SELECT * FROM pets WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        throw new Exception("Failed to prepare query");
    }
    
    $stmt->bind_param("i", $pet_id);
    
    if (!$stmt->execute()) {
        error_log("Execute failed: " . $stmt->error);
        throw new Exception("Failed to execute query");
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $pet = $result->fetch_assoc();
        error_log("Pet found: " . json_encode($pet));
        
        // Clean up the photo path
        if ($pet['photo']) {
            // Get the base filename from the full path
            $photo = basename($pet['photo']);
            
            // Construct the full URL for the photo
            $photo_url = 'http://' . $_SERVER['HTTP_HOST'] . '/PetFurMe-Application/uploads/pet_photos/' . $photo;
            $pet['photo'] = $photo_url;
            
            error_log("Photo URL constructed: " . $photo_url);
        }
        
        ob_clean();
        echo json_encode([
            "success" => true,
            "pet" => $pet
        ]);
    } else {
        error_log("No pet found with ID: " . $pet_id);
        ob_clean();
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Pet not found"
        ]);
    }

    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    ob_clean();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

// Ensure the output buffer is cleaned and closed
ob_end_flush();
?> 