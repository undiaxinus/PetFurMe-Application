<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

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
    require_once '../../config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
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

    // Start transaction
    $conn->begin_transaction();

    // Prepare the base SQL query
    $sql = "UPDATE pets SET 
            name = ?, 
            type = ?, 
            breed = ?, 
            age = ?, 
            size = ?, 
            weight = ?, 
            allergies = ?, 
            notes = ?, 
            gender = ?, 
            category = ?";

    // Handle photo upload if present
    $photoData = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $sql .= ", photo = ?";
        $photoData = file_get_contents($_FILES['photo']['tmp_name']);
    }

    $sql .= " WHERE id = ? AND user_id = ?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    // Create types string and params array
    $types = "sssssssssss";  // 11 parameters (10 fields + category)
    $params = [
        $petData['name'],
        $petData['type'],
        $petData['breed'],
        $petData['age'],
        $petData['size'],
        $petData['weight'],
        $petData['allergies'],
        $petData['notes'],
        $petData['gender'],
        $petData['category']
    ];

    if ($photoData !== null) {
        $types .= "b";  // 'b' for BLOB data
        $params[] = $photoData;
    }

    $types .= "ii";  // Add types for pet_id and user_id
    $params[] = $petData['pet_id'];
    $params[] = $petData['user_id'];

    // Bind parameters
    $stmt->bind_param($types, ...$params);

    // Execute the query
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    // Commit transaction
    $conn->commit();

    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Pet profile updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No changes were made or pet not found'
        ]);
    }

    $stmt->close();

} catch (Exception $e) {
    // Rollback transaction if active
    if (isset($conn) && $conn->connect_errno === 0) {
        $conn->rollback();
    }
    
    error_log("Error updating pet: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update pet profile: ' . $e->getMessage()
    ]);
}

if (isset($conn)) {
    $conn->close();
}
?> 