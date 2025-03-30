<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../config/database.php';

try {
    // Enable detailed error logging
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    
    // Initialize database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Log MySQL server variables 
    $max_allowed_packet_query = "SHOW VARIABLES LIKE 'max_allowed_packet'";
    $result = $db->query($max_allowed_packet_query);
    if ($row = $result->fetch_assoc()) {
        error_log("MySQL max_allowed_packet: " . $row['Value']);
    }
    
    // Get JSON data from the request
    $jsonData = isset($_POST['data']) ? json_decode($_POST['data'], true) : null;
    if (!$jsonData) {
        throw new Exception('No data provided');
    }
    
    // Debug: Log all incoming data keys
    error_log("Received data fields: " . implode(", ", array_keys($jsonData)));
    
    // Check for required user_id
    if (!isset($jsonData['user_id'])) {
        throw new Exception('User ID is required');
    }
    
    // Initialize variables
    $user_id = $jsonData['user_id'];
    $updated_data = [];
    $photo_path = null;
    
    // Start building SQL and params
    $sql_parts = [];
    $params = [];
    $types = '';
    
    // Handle base64 photo data for photo_data column
    $has_photo_data = false;
    if (isset($jsonData['photo_data']) && !empty($jsonData['photo_data'])) {
        $has_photo_data = true;
        $base64_length = strlen($jsonData['photo_data']);
        error_log("Photo data received (base64 length: {$base64_length})");
        
        // Decode base64 to binary
        $binary_data = base64_decode($jsonData['photo_data'], true);
        if ($binary_data === false) {
            error_log("Failed to decode base64 data");
            throw new Exception('Invalid base64 image data');
        }
        
        $binary_length = strlen($binary_data);
        error_log("Converted to binary data (size: {$binary_length} bytes)");
        
        try {
            // Verify database table structure
            $structure_query = "DESCRIBE users photo_data";
            $structure_result = $db->query($structure_query);
            
            if ($structure_result && $structure_row = $structure_result->fetch_assoc()) {
                error_log("photo_data column exists with type: " . $structure_row['Type']);
            } else {
                error_log("ERROR: photo_data column doesn't exist or couldn't be queried");
            }
            
            // Add to SQL parts with explicit handling for binary data
            $sql_parts[] = "photo_data = ?";
            $params[] = $binary_data;
            $types .= 'b'; // 'b' for BLOB data
            
            // Set photo column to NULL since we're using binary storage
            $sql_parts[] = "photo = NULL";
            
            $updated_data['photo_data_updated'] = true;
            $updated_data['binary_size'] = $binary_length;
            
        } catch (Exception $e) {
            error_log("Error processing photo data: " . $e->getMessage());
            throw new Exception("Error processing photo: " . $e->getMessage());
        }
    } else {
        error_log("No photo_data field received in the request");
    }
    
    // Handle traditional file upload (fallback) - only used if no binary data
    if (!$has_photo_data && isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../../uploads/user_photos/';
        
        // Create directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Generate unique filename
        $filename = 'user_' . $user_id . '_' . time() . '.png';
        $target_file = $upload_dir . $filename;
        
        // Move uploaded file
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $target_file)) {
            $photo_path = 'user_photos/' . $filename;
            $sql_parts[] = "photo = ?";
            $params[] = $photo_path;
            $types .= 's';
            
            $updated_data['photo'] = $photo_path;
        }
    }
    
    // Add other fields to update
    $fields_to_update = [
        'name' => 's',
        'email' => 's',
        'phone' => 's',
        'address' => 's'
    ];
    
    foreach ($fields_to_update as $field => $type) {
        if (isset($jsonData[$field]) && $jsonData[$field] !== '') {
            $sql_parts[] = "$field = ?";
            $params[] = $jsonData[$field];
            $types .= $type;
            $updated_data[$field] = $jsonData[$field];
        }
    }
    
    // If nothing to update, return success
    if (empty($sql_parts)) {
        echo json_encode([
            'success' => true,
            'message' => 'No changes to update'
        ]);
        exit;
    }
    
    // Build the complete SQL query
    $sql = "UPDATE users SET " . implode(', ', $sql_parts) . " WHERE id = ?";
    $params[] = $user_id;
    $types .= 'i';
    
    error_log("SQL Query: " . $sql);
    error_log("Parameter types: " . $types);
    error_log("Num params: " . count($params));
    
    // Prepare and execute the query
    $stmt = $db->prepare($sql);
    if (!$stmt) {
        error_log("MySQL Prepare Error: " . $db->error);
        throw new Exception("Prepare failed: " . $db->error);
    }
    
    // Bind parameters
    if (!$stmt->bind_param($types, ...$params)) {
        error_log("MySQL Bind Error: " . $stmt->error);
        throw new Exception("Failed to bind parameters: " . $stmt->error);
    }
    
    // Execute the statement
    if (!$stmt->execute()) {
        error_log("MySQL Execute Error: " . $stmt->error);
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    error_log("SQL execution completed successfully. Affected rows: " . $stmt->affected_rows);
    
    // Get updated user data to return
    $select_sql = "SELECT id, uuid, username, name, email, phone, address, role, verified_by, photo, 
                  IF(photo_data IS NULL, 0, LENGTH(photo_data)) as photo_data_size 
                  FROM users WHERE id = ?";
    $select_stmt = $db->prepare($select_sql);
    $select_stmt->bind_param('i', $user_id);
    $select_stmt->execute();
    $result = $select_stmt->get_result();
    $updated_user = $result->fetch_assoc();
    
    if ($updated_user) {
        $updated_data = array_merge($updated_data, $updated_user);
        error_log("Photo data size in database: " . $updated_user['photo_data_size'] . " bytes");
    }
    
    $response = [
        'success' => true,
        'message' => 'Profile updated successfully',
        'photo_binary_updated' => $has_photo_data,
        'photo_data_size' => $updated_user['photo_data_size'] ?? 0,
        'updated_data' => $updated_data
    ];
    
    echo json_encode($response);

} catch (Exception $e) {
    error_log("Error in update_user_data.php: " . $e->getMessage());
    error_log("Error trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($select_stmt)) {
        $select_stmt->close();
    }
    if (isset($db)) {
        $db->close();
    }
}
?> 