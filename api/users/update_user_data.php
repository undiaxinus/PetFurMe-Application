<?php
// Prevent any output before headers
error_reporting(E_ALL);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

include '../config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Debug logs
    error_log("POST data received: " . print_r($_POST, true));
    error_log("FILES data received: " . print_r($_FILES, true));

    // Check if data was received
    if (!isset($_POST['data'])) {
        throw new Exception("No data received");
    }

    // Decode JSON data
    $jsonData = json_decode($_POST['data'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data: " . json_last_error_msg());
    }

    // Validate user_id
    if (!isset($jsonData['user_id'])) {
        throw new Exception("User ID is required");
    }

    // Initialize photo variables
    $photo_binary = null;
    $photo_path = null;
    $upload_dir = '../../uploads/user_photos/';

    // Ensure upload directory exists
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // Handle file upload
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        // Generate unique filename
        $filename = 'user_' . $jsonData['user_id'] . '_' . time() . '.png';
        $target_path = $upload_dir . $filename;

        // Get binary data from uploaded file
        $photo_binary = file_get_contents($_FILES['photo']['tmp_name']);
        
        // Save physical file
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $target_path)) {
            $photo_path = 'user_photos/' . $filename;
            chmod($target_path, 0666); // Set proper permissions
            error_log("Photo saved successfully at: " . $target_path);
        } else {
            error_log("Failed to move uploaded file to: " . $target_path);
            throw new Exception("Failed to save photo file");
        }
    }
    // Handle base64 image data
    else if (isset($jsonData['photo_base64'])) {
        $photo_binary = base64_decode($jsonData['photo_base64']);
        $filename = 'user_' . $jsonData['user_id'] . '_' . time() . '.png';
        $target_path = $upload_dir . $filename;
        
        if (file_put_contents($target_path, $photo_binary)) {
            $photo_path = 'user_photos/' . $filename;
            chmod($target_path, 0666);
            error_log("Base64 photo saved successfully");
        } else {
            error_log("Failed to save base64 photo");
            throw new Exception("Failed to save base64 photo");
        }
    }

    // Debug log the received data before processing
    error_log("Received data before processing: " . print_r($jsonData, true));

    // Start building the query
    $updates = [];
    $params = [];
    $types = "";

    // Add fields to update if they exist
    if (isset($jsonData['name'])) {
        $updates[] = "name = ?";
        $params[] = $jsonData['name'];
        $types .= "s";
    }
    if (isset($jsonData['email'])) {
        $updates[] = "email = ?";
        $params[] = $jsonData['email'];
        $types .= "s";
    }
    if (isset($jsonData['phone'])) {
        $updates[] = "phone = ?";
        $params[] = $jsonData['phone'];
        $types .= "s";
    }
    if (isset($jsonData['address'])) {
        $updates[] = "address = ?";
        $params[] = $jsonData['address'];
        $types .= "s";
    }

    // Add photo binary data if available
    if ($photo_binary !== null) {
        $updates[] = "photo = ?";
        $params[] = $photo_binary;
        $types .= "b"; // 'b' for BLOB data
    }

    // Add user_id to parameters
    $params[] = $jsonData['user_id'];
    $types .= "i";

    // Construct the final query
    $query = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
    error_log("Update query: " . $query);
    error_log("Parameters: " . print_r($params, true));

    // Prepare and execute the query
    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    $stmt->bind_param($types, ...$params);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    // Get updated user data
    $select_stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $select_stmt->bind_param("i", $jsonData['user_id']);
    $select_stmt->execute();
    $result = $select_stmt->get_result();
    $updated_data = $result->fetch_assoc();

    // Convert BLOB to base64 for response
    if (isset($updated_data['photo'])) {
        $updated_data['photo'] = base64_encode($updated_data['photo']);
    }

    $response = [
        'success' => true,
        'message' => 'Profile updated successfully',
        'photo_path' => $photo_path,
        'updated_data' => $updated_data
    ];

    echo json_encode($response);

} catch (Exception $e) {
    error_log("Error in update_user_data.php: " . $e->getMessage());
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