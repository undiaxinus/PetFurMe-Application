<?php
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

    // Get the form data
    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : null;
    $name = isset($_POST['name']) ? $_POST['name'] : null;
    $type = isset($_POST['type']) ? $_POST['type'] : null;
    $breed = isset($_POST['breed']) ? $_POST['breed'] : null;
    $age = isset($_POST['age']) ? intval($_POST['age']) : null;
    $gender = isset($_POST['gender']) ? $_POST['gender'] : null;
    $weight = isset($_POST['weight']) ? floatval($_POST['weight']) : null;
    $size = isset($_POST['size']) ? $_POST['size'] : null;
    $allergies = isset($_POST['allergies']) ? $_POST['allergies'] : null;
    $notes = isset($_POST['notes']) ? $_POST['notes'] : null;
    $category = isset($_POST['category']) ? $_POST['category'] : null;
    
    // Validate required fields
    if (!$user_id || !$name || !$type || !$breed || !$gender) {
        throw new Exception("Missing required fields");
    }

    // Handle photo upload
    $photo_path = null;
    if (isset($_FILES['photo'])) {
        $upload_dir = 'uploads/pet_photos/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $file_name = uniqid() . '.jpg';
        $target_path = $upload_dir . $file_name;
        
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $target_path)) {
            $photo_path = $target_path;
        }
    }

    // Prepare the query
    $query = "INSERT INTO pets (user_id, name, type, breed, age, gender, weight, size, allergies, notes, category, photo, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    $stmt = $db->prepare($query);
    $stmt->bind_param("isssisdsssss", 
        $user_id, $name, $type, $breed, $age, $gender, $weight, $size, $allergies, $notes, $category, $photo_path
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Pet added successfully',
            'pet_id' => $db->insert_id
        ]);
    } else {
        throw new Exception("Failed to insert pet data: " . $stmt->error);
    }

} catch (Exception $e) {
    error_log("Error in pet creation: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error creating pet profile',
        'error' => $e->getMessage()
    ]);
}
?> 