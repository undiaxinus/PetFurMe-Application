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
require_once __DIR__ . '/../config/database.php';

try {
    error_log("Starting pet addition process");
    
    $database = new Database();
    $db = $database->connect();

    // Get the posted data
    $data = json_decode($_POST['data'], true);
    
    // Log the received data for debugging
    error_log("Received data: " . print_r($data, true));
    
    // Debug photo data
    error_log("Photo binary exists: " . (isset($_POST['photo_binary']) ? 'Yes' : 'No'));
    if (isset($_POST['photo_binary'])) {
        error_log("Photo binary length: " . strlen($_POST['photo_binary']));
        error_log("Is base64 flag: " . (isset($_POST['is_base64']) ? $_POST['is_base64'] : 'Not set'));
    }

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
    $data['created_by'] = $data['user_id']; // Default created_by to user_id if not provided

    // Handle photo data
    $photo_data = null;
    if (isset($_POST['photo_binary']) && !empty($_POST['photo_binary'])) {
        $raw_photo = $_POST['photo_binary'];
        error_log("Raw photo data length: " . strlen($raw_photo));
        
        // Check if it's base64 encoded
        if (isset($_POST['is_base64']) && $_POST['is_base64'] == 'true') {
            error_log("Photo is base64 encoded, decoding now");
            // Remove any URL prefix if present (e.g., data:image/jpeg;base64,)
            if (strpos($raw_photo, ',') !== false) {
                list(, $raw_photo) = explode(',', $raw_photo);
                error_log("Removed base64 prefix");
            }
            
            $photo_data = base64_decode($raw_photo);
            error_log("Decoded photo size: " . strlen($photo_data));
            
            // Verify if decoding was successful
            if ($photo_data === false) {
                error_log("Base64 decoding failed");
                $photo_data = null;
            }
        } else {
            // Use raw binary data
            $photo_data = $raw_photo;
            error_log("Using raw binary data: " . strlen($photo_data) . " bytes");
        }
        
        if (empty($photo_data)) {
            error_log("Photo data is empty after processing");
            $photo_data = null;
        } else {
            error_log("Final photo data size: " . strlen($photo_data) . " bytes");
        }
    } else {
        error_log("No photo data provided");
    }

    // Prepare the query
    $query = "INSERT INTO pets (user_id, created_by, name, type, breed, age, gender, weight, allergies, notes, category, photo_data) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    // Bind parameters
    $weight = $data['weight'] ?? null;
    $allergies = $data['allergies'] ?? null;
    $notes = $data['notes'] ?? null;
    $category = $data['category'] ?? $data['type']; // Use type as category if not provided

    // Log binding info
    error_log("Binding parameters for pet insertion");
    error_log("Photo data for binding: " . ($photo_data ? "Present (" . strlen($photo_data) . " bytes)" : "NULL"));

    // Directly insert the photo data without using bind_param for BLOB
    // This is more reliable for handling large binary data
    if ($photo_data === null) {
        // Use a prepared statement without the photo_data for NULL
        $stmt->close(); // Close the previous statement
        
        $query = "INSERT INTO pets (user_id, created_by, name, type, breed, age, gender, weight, allergies, notes, category, photo_data) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)";
                  
        $stmt = $db->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $db->error);
        }
        
        $stmt->bind_param("iisssisssss",
            $data['user_id'],
            $data['created_by'],
            $data['name'],
            $data['type'],
            $data['breed'],
            $data['age'],
            $data['gender'],
            $weight,
            $allergies,
            $notes,
            $category
        );
    } else {
        // For non-NULL photo data, use mysqli's escape_string for proper handling
        $escaped_photo = $db->real_escape_string($photo_data);
        
        // Close the prepared statement
        $stmt->close();
        
        // Use a direct query with the escaped binary data
        $query = "INSERT INTO pets (user_id, created_by, name, type, breed, age, gender, weight, allergies, notes, category, photo_data) 
                  VALUES (
                    {$data['user_id']},
                    {$data['created_by']},
                    '" . $db->real_escape_string($data['name']) . "',
                    '" . $db->real_escape_string($data['type']) . "',
                    " . ($data['breed'] === null ? "NULL" : "'" . $db->real_escape_string($data['breed']) . "'") . ",
                    " . ($data['age'] === null ? "NULL" : $data['age']) . ",
                    '" . $db->real_escape_string($data['gender']) . "',
                    " . ($weight === null ? "NULL" : "'" . $db->real_escape_string($weight) . "'") . ",
                    " . ($allergies === null ? "NULL" : "'" . $db->real_escape_string($allergies) . "'") . ",
                    " . ($notes === null ? "NULL" : "'" . $db->real_escape_string($notes) . "'") . ",
                    '" . $db->real_escape_string($category) . "',
                    _binary'" . $escaped_photo . "'
                  )";
                  
        error_log("Using direct query for photo insertion");
        
        // Execute the direct query
        if (!$db->query($query)) {
            throw new Exception("Direct query failed: " . $db->error);
        }
        
        $insert_id = $db->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Pet added successfully with photo',
            'pet_id' => $insert_id
        ]);
        
        // Exit early as we've already handled the response
        exit();
    }

    // Execute the statement (only for NULL photo_data case)
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Pet added successfully',
            'pet_id' => $db->insert_id
        ]);
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