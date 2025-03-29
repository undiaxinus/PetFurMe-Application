<?php
// Send CORS headers first to avoid "headers already sent" issues
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Handle preflight OPTIONS request immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log all errors
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_log("Update pet script started at: " . date('Y-m-d H:i:s'));
error_log("Full script path: " . __FILE__);
error_log("Document root: " . $_SERVER['DOCUMENT_ROOT']);
error_log("Request URI: " . $_SERVER['REQUEST_URI']);

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
    error_log("Content type: " . (isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : 'Not set'));
    error_log("Raw POST data: " . file_get_contents('php://input'));
    error_log("POST data: " . print_r($_POST, true));
    error_log("FILES data: " . print_r($_FILES, true));

    // Check for data in $_POST directly
    if (!isset($_POST['data'])) {
        throw new Exception('No pet data received');
    }

    // Get the raw POST data
    $data = json_decode($_POST['data'], true);
    
    if (!$data) {
        throw new Exception('Invalid data received');
    }

    // Extract pet data
    $pet_id = $data['pet_id'];
    $user_id = $data['user_id'];
    $name = $data['name'];
    $age = $data['age'];
    $type = $data['type'];
    $breed = $data['breed'];
    $size = isset($data['size']) ? $data['size'] : null;
    $weight = $data['weight'];
    $allergies = $data['allergies'];
    $notes = $data['notes'];
    $gender = $data['gender'];
    $age_unit = isset($data['age_unit']) ? $data['age_unit'] : 'years';

    // Validate required fields
    $requiredFields = ['pet_id', 'user_id', 'name', 'type', 'gender', 'category'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            throw new Exception("Missing required field: {$field}");
        }
    }

    // Check that breed is at least set, even if empty
    if (!isset($data['breed'])) {
        throw new Exception("Breed field must be defined, even if empty");
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
        $name,
        $type,
        $breed,
        $gender,
        $age,
        $weight,
        $allergies,
        $notes,
        $data['category'],
        $photo_binary,  // photo column
        $photo_binary,  // photo_data column
        $pet_id,
        $user_id
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