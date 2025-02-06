<?php
// Prevent any output before headers
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

include_once '../config/Database.php';
require_once '../utils/image_handler.php';

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
    $data = json_decode($_POST['data'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data: " . json_last_error_msg());
    }

    // Validate user_id
    if (!isset($data['user_id'])) {
        throw new Exception("User ID is required");
    }

    // Handle photo upload
    $photo_path = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        error_log("Processing photo upload");
        
        $photo_path = ImageHandler::saveImage($_FILES['photo'], 'user_photos', 'user');
        if (!$photo_path) {
            throw new Exception("Failed to save uploaded file");
        }
    } else if (isset($_FILES['photo'])) {
        switch ($_FILES['photo']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new Exception("The image file is too large. Please upload an image smaller than 2MB.");
            case UPLOAD_ERR_PARTIAL:
                throw new Exception("The image was only partially uploaded. Please try again.");
            case UPLOAD_ERR_NO_FILE:
                throw new Exception("No image file was uploaded.");
            default:
                throw new Exception("There was an error uploading your image. Please try again with a smaller image.");
        }
    }

    // Debug log the received data before processing
    error_log("Received data before processing: " . print_r($data, true));

    // Modify the query to only update fields that have values
    $updates = array();
    $types = '';
    $params = array();

    // Check each field and only include it if it's provided
    if (isset($data['name'])) {
        $updates[] = "name = ?";
        $types .= 's';
        $params[] = $data['name'];
    }

    if (isset($data['address'])) {
        $updates[] = "address = ?";
        $types .= 's';
        $params[] = $data['address'];
    }

    if (isset($data['phone'])) {
        $updates[] = "phone = ?";
        $types .= 's';
        $params[] = $data['phone'];
    }

    if (isset($data['email'])) {
        $updates[] = "email = ?";
        $types .= 's';
        $params[] = $data['email'];
    }

    // Add the complete_credentials check
    $updates[] = "complete_credentials = CASE 
        WHEN name IS NOT NULL AND name != '' AND
             email IS NOT NULL AND email != '' AND
             phone IS NOT NULL AND phone != '' AND
             address IS NOT NULL AND address != ''
        THEN 1
        ELSE 0
    END";

    // Add user_id to parameters
    $types .= 'i';
    $params[] = $data['user_id'];

    // Construct the final query
    $query = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";

    // Debug log the query and parameters
    error_log("Query to execute: " . $query);
    error_log("Parameters: " . json_encode($params));

    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    // Bind parameters dynamically
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    // Check if any rows were affected
    if ($stmt->affected_rows > 0) {
        // Fetch updated user data to confirm changes
        $select_query = "SELECT name, email, phone, address, complete_credentials 
                        FROM users WHERE id = ?";
        $select_stmt = $db->prepare($select_query);
        $select_stmt->bind_param("i", $data['user_id']);
        $select_stmt->execute();
        $result = $select_stmt->get_result();
        $updated_data = $result->fetch_assoc();

        $response = [
            'success' => true,
            'message' => 'Profile updated successfully',
            'photo_path' => $photo_path,
            'updated_data' => $updated_data
        ];
    } else {
        $response = [
            'success' => false,
            'message' => 'No changes were made to the profile'
        ];
    }

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
    if (isset($db)) {
        $db->close();
    }
}
?> 