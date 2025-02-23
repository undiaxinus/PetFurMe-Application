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

require_once __DIR__ . '/../config/Database.php';

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

    // Handle photo upload if provided
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = __DIR__ . '/../../uploads/pet_photos/';
        
        // Create directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $filename = $_FILES['photo']['name'];
        $target_path = $upload_dir . $filename;

        if (move_uploaded_file($_FILES['photo']['tmp_name'], $target_path)) {
            // Update the photo path in petData
            $data['photo'] = $filename;
        } else {
            throw new Exception("Failed to move uploaded file");
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
    if (isset($data['photo'])) {
        $query .= ", photo = ?";
        $params[] = $data['photo'];
        $types .= "s"; // 's' for string path
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
            "photo_path" => $data['photo'] // Return the photo path for confirmation
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