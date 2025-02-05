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

    // Debug log the received data
    error_log("Received POST data: " . print_r($_POST, true));
    error_log("Received FILES data: " . print_r($_FILES, true));

    // Build query with proper path format
    $query = "UPDATE users SET 
              name = ?, 
              age = ?, 
              store_address = ?, 
              phone = ?, 
              email = ?";

    // Add photo to query only if it exists
    if ($photo_path !== null) {
        $query .= ", photo = ?";
    }

    $query .= " WHERE id = ?";

    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    // Bind parameters based on whether photo exists
    if ($photo_path !== null) {
        $stmt->bind_param(
            "sissssi",
            $data['name'],
            $data['age'],
            $data['store_address'],
            $data['phone'],
            $data['email'],
            $photo_path,
            $data['user_id']
        );
    } else {
        $stmt->bind_param(
            "sisssi",
            $data['name'],
            $data['age'],
            $data['store_address'],
            $data['phone'],
            $data['email'],
            $data['user_id']
        );
    }

    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $response = [
        'success' => true,
        'message' => 'Profile updated successfully',
        'photo_path' => $photo_path
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
    if (isset($db)) {
        $db->close();
    }
}
?> 