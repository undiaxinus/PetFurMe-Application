<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Correctly define the log directory path
$logDir = __DIR__ . '/../logs'; // Set to the correct logs directory
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true); // Create the directory if it doesn't exist
}

$logFile = $logDir . '/pet_addition_error.log'; // Define the log file path

// Set the error log file
ini_set('error_log', $logFile);

// Add these headers at the very top of the file
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Allow-Credentials: true");

// If it's a preflight request, return immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database connection
require_once __DIR__ . '/../config/Database.php';

try {
    error_log("Starting pet addition process");
    
    $database = new Database();
    $db = $database->connect();

    // Get the posted data
    $data = json_decode($_POST['data'], true);
    
    // Log the received data for debugging
    error_log("Received data: " . print_r($data, true));

    // Validate required fields
    $requiredFields = ['user_id', 'name', 'type', 'gender']; // Removed 'breed' and 'age' from required fields
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || $data[$field] === null || $data[$field] === '') {
            throw new Exception("Missing required field: {$field}");
        }
    }

    // Set default values for optional fields
    $data['breed'] = $data['breed'] ?? null; // Allow breed to be null
    $data['age'] = $data['age'] ?? null; // Allow age to be null
    $data['age_unit'] = $data['age_unit'] ?? 'years'; // Default to 'years' if not provided

    // Prepare the query
    $query = "INSERT INTO pets (user_id, created_by, name, type, breed, age, gender, weight, size, allergies, notes, category, photo) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    // Bind parameters
    $weight = $data['weight'] ?? null; // Ensure this is a variable
    $size = isset($data['size']) && $data['size'] !== '' ? $data['size'] : 'unknown'; // Set to 'unknown' if not provided
    $allergies = $data['allergies'] ?? null; // Ensure this is a variable
    $notes = $data['notes'] ?? null;         // Ensure this is a variable
    $photo = $data['photo'] ?? null;         // Ensure this is a variable

    // Log the parameters being bound
    error_log("Binding parameters: " . json_encode([
        $data['user_id'],
        $data['created_by'],
        $data['name'],
        $data['type'],
        $data['breed'],
        $data['age'],
        $data['gender'],
        $weight,
        $size, // This will now be 'unknown' if not provided
        $allergies,
        $notes,
        $data['category'],
        $photo
    ]));

    // Log the types of parameters being bound
    error_log("Types: " . json_encode([
        gettype($data['user_id']),
        gettype($data['created_by']),
        gettype($data['name']),
        gettype($data['type']),
        gettype($data['breed']),
        gettype($data['age']),
        gettype($data['gender']),
        gettype($weight),
        gettype($size),
        gettype($allergies),
        gettype($notes),
        gettype($data['category']),
        gettype($photo)
    ]));

    $stmt->bind_param("iisssisssssss",
        $data['user_id'],
        $data['created_by'],
        $data['name'],
        $data['type'],
        $data['breed'],
        $data['age'],
        $data['gender'],
        $weight,
        $size, // This will now be 'unknown' if not provided
        $allergies,
        $notes,
        $data['category'],
        $photo // Ensure this is a variable
    );

    // Execute the statement
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Pet added successfully',
            'pet_id' => $db->insert_id
        ]);

        // Inside the try block where photo is handled
        if (isset($_POST['photo_binary']) && isset($_POST['is_base64'])) {
            // Convert base64 to binary
            $binary_data = base64_decode($_POST['photo_binary']);
            
            // Update the SQL query to include photo_data
            $sql = "UPDATE pets SET photo_data = ? WHERE id = ? AND user_id = ?";
            $stmt = $db->prepare($sql);
            
            if (!$stmt) {
                throw new Exception("Failed to prepare statement: " . $db->error);
            }
            
            $stmt->bind_param("bii", $binary_data, $db->insert_id, $data['user_id']);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to store photo data: " . $stmt->error);
            }
            
            // Log success
            error_log("Successfully stored binary image data for pet ID: " . $db->insert_id);
        }
    } else {
        throw new Exception("Failed to insert pet data: " . $stmt->error);
    }

} catch (Exception $e) {
    error_log("Error in add_pet.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error adding pet profile',
        'error' => $e->getMessage()
    ]);
}
?> 