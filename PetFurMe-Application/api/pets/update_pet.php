<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Log all errors
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_log("Update pet script started at: " . date('Y-m-d H:i:s'));
error_log("Full script path: " . __FILE__);
error_log("Document root: " . $_SERVER['DOCUMENT_ROOT']);
error_log("Request URI: " . $_SERVER['REQUEST_URI']);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Test database connection first
    require_once '../config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    error_log("Database connection successful");

    // Log incoming data for debugging
    error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
    error_log("Content type: " . $_SERVER['CONTENT_TYPE']);
    error_log("Raw POST data: " . file_get_contents('php://input'));
    error_log("POST data: " . print_r($_POST, true));
    error_log("FILES data: " . print_r($_FILES, true));

    // Get the raw JSON data
    if (!isset($_POST['data'])) {
        throw new Exception('No pet data received');
    }

    $petDataJson = $_POST['data'];
    $petData = json_decode($petDataJson, true);

    if (!$petData) {
        throw new Exception('Invalid pet data format: ' . json_last_error_msg());
    }

    // Validate required fields
    $requiredFields = ['pet_id', 'user_id', 'name', 'type', 'breed', 'gender', 'category'];
    foreach ($requiredFields as $field) {
        if (!isset($petData[$field]) || empty($petData[$field])) {
            throw new Exception("Missing required field: {$field}");
        }
    }

    // Handle photo update - match the working approach from AddPetName.js
    $photo_binary = null;
    if (isset($_POST['photo'])) {
        // Convert base64 to binary data
        $photo_binary = base64_decode($_POST['photo']);
    }

    // Start transaction
    $db->begin_transaction();

    // Prepare the SQL query WITHOUT the size field
    $sql = "UPDATE pets SET 
            name = ?,
            type = ?,
            breed = ?,
            gender = ?,
            age = ?,
            weight = ?,
            allergies = ?,
            notes = ?,
            category = ?,
            photo = ?,      -- Update both photo and photo_data
            photo_data = ?  -- This ensures trigger works properly
            WHERE id = ? AND user_id = ?";

    $stmt = $db->prepare($sql);
    
    // Create params array WITHOUT the size field
    $params = [
        $petData['name'],
        $petData['type'],
        $petData['breed'],
        $petData['gender'],
        $petData['age'],
        $petData['weight'],
        $petData['allergies'],
        $petData['notes'],
        $petData['category'],
        $photo_binary,  // photo column
        $photo_binary,  // photo_data column
        $petData['pet_id'],
        $petData['user_id']
    ];

    // Execute with params
    if (!$stmt->execute($params)) {
        throw new Exception($stmt->error);
    }

    // Commit transaction
    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Pet updated successfully'
    ]);

} catch (Exception $e) {
    // Rollback transaction if active
    if (isset($db) && $db->connect_errno === 0) {
        $db->rollback();
    }
    
    error_log("Error updating pet: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update pet profile: ' . $e->getMessage()
    ]);
}

if (isset($db)) {
    $db->close();
}
?> 