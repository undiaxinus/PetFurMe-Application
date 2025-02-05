<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';

try {
    $database = new Database();
    $conn = $database->connect();
    
    // Get the posted data
    if (!isset($_POST['data'])) {
        throw new Exception("No data provided");
    }
    
    $data = json_decode($_POST['data'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data");
    }

    // Handle file upload if photo is included
    $photo_path = null;
    $photo_blob = null;
    if (isset($_FILES['photo'])) {
        $upload_dir = 'uploads/pet_photos/';
        
        // Create directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Generate unique filename
        $file_extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $unique_filename = 'pet_' . uniqid() . '.' . $file_extension;
        $file_tmp = $_FILES['photo']['tmp_name'];
        $target_path = $upload_dir . $unique_filename;
        
        // Read file contents for database storage
        $photo_blob = file_get_contents($file_tmp);
        
        // Move uploaded file to filesystem
        if (move_uploaded_file($file_tmp, $target_path)) {
            $photo_path = $target_path;
        } else {
            throw new Exception("Failed to upload photo");
        }
    }

    // Prepare the query
    $query = "UPDATE pets SET 
              name = ?, age = ?, type = ?, breed = ?, 
              size = ?, weight = ?, gender = ?, 
              allergies = ?, notes = ?";
    
    $params = [
        $data['name'], $data['age'], $data['type'], $data['breed'],
        $data['size'], $data['weight'], $data['gender'],
        $data['allergies'], $data['notes']
    ];
    
    $types = "sssssssss"; // Initial types for the base parameters

    // Add photo to update if uploaded
    if ($photo_path) {
        $query .= ", photo = ?, photo_blob = ?";
        $params[] = $photo_path;
        $params[] = $photo_blob;
        $types .= "sb"; // 's' for string path, 'b' for blob data
    }

    $query .= " WHERE id = ? AND user_id = ?";
    $params[] = $data['pet_id'];
    $params[] = $data['user_id'];
    $types .= "ii"; // Add types for pet_id and user_id

    // Prepare and execute using mysqli
    $stmt = mysqli_prepare($conn, $query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . mysqli_error($conn));
    }

    // Bind parameters using mysqli
    mysqli_stmt_bind_param($stmt, $types, ...$params);
    
    $result = mysqli_stmt_execute($stmt);

    if ($result) {
        http_response_code(200);
        echo json_encode([
            "success" => true, 
            "message" => "Pet updated successfully",
            "photo_path" => $photo_path // Return the photo path for confirmation
        ]);
    } else {
        throw new Exception("Failed to update pet: " . mysqli_error($conn));
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conn);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?> 