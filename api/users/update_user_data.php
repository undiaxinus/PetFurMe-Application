<?php
// Prevent any output before headers
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/update_user.log');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../config/Database.php';

function logError($message, $data = null) {
    $log = date('Y-m-d H:i:s') . " - " . $message;
    if ($data !== null) {
        $log .= "\nData: " . print_r($data, true);
    }
    error_log($log . "\n");
}

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Set proper character encoding
    $db->set_charset("utf8mb4");
    $db->query("SET NAMES utf8mb4");
    $db->query("SET CHARACTER SET utf8mb4");

    // Debug logs - enhanced logging
    logError("Content type: " . (isset($_SERVER["CONTENT_TYPE"]) ? $_SERVER["CONTENT_TYPE"] : 'Not set'));
    logError("Request method: " . $_SERVER['REQUEST_METHOD']);
    
    // Log summary of received data
    logError("POST data keys: " . implode(", ", array_keys($_POST)));
    if (isset($_POST['photo_base64'])) {
        logError("photo_base64 length: " . strlen($_POST['photo_base64']));
    }
    
    logError("FILES data: " . (isset($_FILES['photo']) ? 'Photo file present' : 'No photo file'));
    
    // Get user_id from POST data
    if (!isset($_POST['user_id'])) {
        throw new Exception("User ID is required");
    }
    $user_id = $_POST['user_id'];

    // Initialize arrays for query building
    $updates = [];
    $params = [];
    $types = "";

    // Start transaction
    $db->begin_transaction();

    // PROCESS PHOTO - COMPREHENSIVE APPROACH
    $photo_updated = false;
    
    // Option 1: Process base64 data
    if (isset($_POST['photo_base64']) && !empty($_POST['photo_base64'])) {
        logError("Processing base64 photo data");
        
        try {
            // Decode base64 to binary
            $photo_data = base64_decode($_POST['photo_base64'], true);
            if ($photo_data === false) {
                throw new Exception("Invalid base64 data");
            }
            
            $photo_size = strlen($photo_data);
            logError("Decoded base64 photo, size: $photo_size bytes");
            
            if ($photo_size < 10) {
                throw new Exception("Photo data too small, likely invalid");
            }
            
            // Add this after decoding the base64 data
            logError("Base64 decode check - First 20 bytes: " . bin2hex(substr($photo_data, 0, 20)));
            logError("Base64 decode check - Is valid image: " . (strpos($photo_data, "\xFF\xD8\xFF") === 0 ? "Yes (JPEG)" : "No"));
            
            // Prepare statement for photo update
            $photo_query = "UPDATE users SET photo = ? WHERE id = ?";
            $photo_stmt = $db->prepare($photo_query);
            
            if (!$photo_stmt) {
                throw new Exception("Failed to prepare photo statement: " . $db->error);
            }
            
            // Use "b" for BLOB data type
            $photo_stmt->bind_param("si", $param_photo, $user_id);
            $param_photo = $photo_data; // This properly assigns the data to the parameter
            
            if (!$photo_stmt->execute()) {
                throw new Exception("Failed to execute photo update: " . $photo_stmt->error);
            }
            
            logError("Successfully stored base64 photo of size: $photo_size bytes");
            $photo_stmt->close();
            $photo_updated = true;
        } catch (Exception $e) {
            logError("Base64 photo processing error: " . $e->getMessage());
            // Continue with other updates even if photo fails
        }
    }
    
    // Option 2: Process uploaded file (if base64 method failed)
    if (!$photo_updated && isset($_FILES['photo']) && $_FILES['photo']['error'] == 0) {
        logError("Processing uploaded file photo");
        
        try {
            $photo_data = file_get_contents($_FILES['photo']['tmp_name']);
            $photo_size = strlen($photo_data);
            
            logError("Read uploaded photo, size: $photo_size bytes");
            
            // Prepare statement for photo update
            $photo_query = "UPDATE users SET photo = ? WHERE id = ?";
            $photo_stmt = $db->prepare($photo_query);
            
            if (!$photo_stmt) {
                throw new Exception("Failed to prepare photo statement: " . $db->error);
            }
            
            // Use "b" for BLOB data type
            $photo_stmt->bind_param("si", $param_photo, $user_id);
            $param_photo = $photo_data; // This properly assigns the data to the parameter
            
            if (!$photo_stmt->execute()) {
                throw new Exception("Failed to execute photo update: " . $photo_stmt->error);
            }
            
            logError("Successfully stored file photo of size: $photo_size bytes");
            $photo_stmt->close();
            $photo_updated = true;
        } catch (Exception $e) {
            logError("File photo processing error: " . $e->getMessage());
        }
    }

    // Process other fields
    $fields = ['name', 'email', 'phone', 'address'];
    foreach ($fields as $field) {
        if (isset($_POST[$field]) && !empty($_POST[$field])) {
            $updates[] = "$field = ?";
            $params[] = $_POST[$field];
            $types .= "s";
        }
    }

    // Only run update if there are fields to update
    if (count($updates) > 0) {
        // Add user_id to parameters
        $params[] = $user_id;
        $types .= "i";
        
        // Construct and execute query
        $query = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
        logError("Update query: $query with param types: $types");
        
        $stmt = $db->prepare($query);
        if (!$stmt) {
            throw new Exception("Failed to prepare statement: " . $db->error);
        }
        
        $stmt->bind_param($types, ...$params);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to execute update: " . $stmt->error);
        }
        
        $stmt->close();
    }

    // Get updated user data
    $select_stmt = $db->prepare("SELECT id, name, email, phone, address, role FROM users WHERE id = ?");
    $select_stmt->bind_param("i", $user_id);
    $select_stmt->execute();
    $result = $select_stmt->get_result();
    $updated_data = $result->fetch_assoc();

    // Add photo URL for frontend
    $updated_data['photo_url'] = "api/users/get_user_photo.php?user_id=" . $user_id;

    // Commit transaction
    $db->commit();
    logError("Transaction committed successfully");

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'updated_data' => $updated_data
    ]);

} catch (Exception $e) {
    // Rollback on error
    if (isset($db) && $db->ping()) {
        $db->rollback();
        logError("Transaction rolled back");
    }
    
    $error_details = [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ];
    logError("Error details: " . print_r($error_details, true));
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug_info' => $error_details
    ]);
} finally {
    // Close any open statements and connections
    if (isset($select_stmt)) {
        $select_stmt->close();
    }
    if (isset($db)) {
        $db->close();
    }
}
?> 