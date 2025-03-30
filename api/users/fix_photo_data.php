<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/database.php';

try {
    // Enable detailed error logging
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    
    // Increase memory limit for large images
    ini_set('memory_limit', '256M');
    
    // Get user ID
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    if (!$user_id) {
        throw new Exception('User ID is required');
    }
    
    // Get photo data from POST request
    $photo_data = isset($_POST['photo_data']) ? $_POST['photo_data'] : null;
    if (!$photo_data) {
        throw new Exception('No photo data provided');
    }
    
    // Debug info
    $data_length = strlen($photo_data);
    error_log("Received photo data of length: " . $data_length);
    
    // Initialize database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Make sure the photo_data column exists and is correctly typed
    $check_column = "SHOW COLUMNS FROM users LIKE 'photo_data'";
    $column_result = $db->query($check_column);
    
    if ($column_result->num_rows === 0) {
        // Column doesn't exist, create it
        $create_column = "ALTER TABLE users ADD COLUMN photo_data MEDIUMBLOB";
        if (!$db->query($create_column)) {
            throw new Exception("Failed to create photo_data column: " . $db->error);
        }
        error_log("Created photo_data column");
    } else {
        $column_info = $column_result->fetch_assoc();
        error_log("Found column 'photo_data' with type: " . $column_info['Type']);
        
        // If not MEDIUMBLOB, alter it
        if (strtolower($column_info['Type']) !== 'mediumblob') {
            $alter_column = "ALTER TABLE users MODIFY COLUMN photo_data MEDIUMBLOB";
            if (!$db->query($alter_column)) {
                throw new Exception("Failed to modify photo_data column: " . $db->error);
            }
            error_log("Modified photo_data column to MEDIUMBLOB");
        }
    }
    
    // Decode base64
    $binary_data = base64_decode($photo_data);
    if ($binary_data === false) {
        throw new Exception('Invalid base64 data');
    }
    
    $binary_length = strlen($binary_data);
    error_log("Decoded binary data length: " . $binary_length);
    
    // Use a simple, direct query approach
    $stmt = $db->prepare("UPDATE users SET photo_data = ?, photo = NULL WHERE id = ?");
    
    // Use mysqli_stmt_bind_param directly, being explicit about the blob
    $null = NULL;
    $stmt->bind_param("bi", $null, $user_id);
    
    // Explicitly bind the blob parameter
    $stmt->send_long_data(0, $binary_data);
    
    // Execute the query
    if (!$stmt->execute()) {
        throw new Exception("Failed to update photo data: " . $stmt->error);
    }
    
    error_log("Photo data updated successfully for user ID: " . $user_id);
    
    // Verify the update
    $verify = $db->prepare("SELECT LENGTH(photo_data) as data_length FROM users WHERE id = ?");
    $verify->bind_param("i", $user_id);
    $verify->execute();
    $result = $verify->get_result();
    $row = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'message' => 'Photo data saved successfully',
        'data_length' => $row['data_length']
    ]);
    
} catch (Exception $e) {
    error_log("Error in fix_photo_data.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 