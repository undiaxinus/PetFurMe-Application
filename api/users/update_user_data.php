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
        
        // Check file size (2MB limit)
        $maxFileSize = 2 * 1024 * 1024;
        if ($_FILES['photo']['size'] > $maxFileSize) {
            throw new Exception("File size too large. Please upload an image smaller than 2MB.");
        }
        
        // Create uploads directory if it doesn't exist
        $upload_dir = 'C:/xampp/htdocs/PetFurMe-Application/api/users/uploads/profile_photos/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Generate unique filename
        $file_extension = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION));
        // Validate file extension
        $allowed_extensions = ['jpg', 'jpeg', 'png'];
        if (!in_array($file_extension, $allowed_extensions)) {
            throw new Exception("Only JPG, JPEG and PNG files are allowed.");
        }
        
        $new_filename = 'profile_' . uniqid() . '.' . $file_extension;
        $full_path = $upload_dir . $new_filename;
        $photo_path = 'uploads/profile_photos/' . $new_filename; // This is what gets stored in DB
        
        error_log("Full path for upload: " . $full_path);
        
        // Ensure the file is an actual image
        if (!getimagesize($_FILES['photo']['tmp_name'])) {
            throw new Exception("File is not a valid image");
        }
        
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $full_path)) {
            error_log("File successfully moved to: " . $full_path);
            // Set proper permissions
            chmod($full_path, 0644);
        } else {
            error_log("Failed to move uploaded file. Upload error: " . $_FILES['photo']['error']);
            error_log("Upload path exists: " . (file_exists(dirname($full_path)) ? 'Yes' : 'No'));
            error_log("Upload path is writable: " . (is_writable(dirname($full_path)) ? 'Yes' : 'No'));
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