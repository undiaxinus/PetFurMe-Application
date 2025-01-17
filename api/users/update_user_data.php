<?php
// Prevent any output before headers
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

include_once '../config/Database.php';

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
    $data = json_decode($_POST['data']);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data: " . json_last_error_msg());
    }

    // Validate user_id
    if (!isset($data->user_id)) {
        throw new Exception("User ID is required");
    }

    // Handle photo upload
    $photo_path = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        error_log("Processing photo upload");
        
        // Check file size (2MB limit)
        $maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
        if ($_FILES['photo']['size'] > $maxFileSize) {
            throw new Exception("File size too large. Please upload an image smaller than 2MB.");
        }
        
        // Create uploads directory if it doesn't exist
        $upload_dir = '../uploads/profile_photos';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Generate unique filename
        $file_extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $new_filename = uniqid() . '.' . $file_extension;
        $photo_path = 'uploads/profile_photos/' . $new_filename;
        $full_path = '../' . $photo_path;
        
        error_log("Attempting to move uploaded file to: " . $full_path);
        
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $full_path)) {
            error_log("File successfully moved to: " . $full_path);
        } else {
            error_log("Failed to move uploaded file. Upload error: " . $_FILES['photo']['error']);
            throw new Exception("Failed to save uploaded file. Please try again with a smaller image.");
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

    // Build query
    $query = "UPDATE users SET 
              name = ?, 
              age = ?, 
              store_address = ?, 
              phone = ?, 
              email = ?";

    if ($photo_path !== null) {
        $query .= ", photo = ?";
    }

    $query .= " WHERE id = ?";

    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    // Create params array
    $params = array(
        $data->name,
        $data->age,
        $data->address,
        $data->phone,
        $data->email
    );

    // Set types string
    $types = "sisss";

    // Add photo path if exists
    if ($photo_path !== null) {
        $params[] = $photo_path;
        $types .= "s"; // string for photo path
        error_log("Added photo path to params array: " . $photo_path);
    }

    // Add user_id
    $params[] = $data->user_id;
    $types .= "i";

    // Debug log
    error_log("Final query: " . $query);
    error_log("Types string: " . $types);
    error_log("Number of params: " . count($params));

    // Create bind_params array with references
    $bind_params = array($types);
    foreach ($params as $key => $value) {
        $bind_params[] = &$params[$key];
    }

    if (!call_user_func_array(array($stmt, 'bind_param'), $bind_params)) {
        throw new Exception("Failed to bind parameters: " . $stmt->error);
    }

    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $response = [
        'success' => true,
        'message' => 'Profile updated successfully',
        'affected_rows' => $stmt->affected_rows
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