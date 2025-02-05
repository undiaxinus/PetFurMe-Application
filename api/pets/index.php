<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

include_once '../config/Database.php';

error_log('Received POST data: ' . print_r($_POST, true));
error_log('Received FILES data: ' . print_r($_FILES, true));

error_log("Starting pet creation process");

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get the form data
    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : null;
    $created_by = isset($_POST['created_by']) ? intval($_POST['created_by']) : null;
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

    // Prepare the query - note the correct number of placeholders (13)
    $query = "INSERT INTO pets (user_id, created_by, name, type, breed, age, gender, weight, size, allergies, notes, category, photo) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    error_log("Query to execute: " . $query);
    error_log("Parameters: " . json_encode([
        'user_id' => $user_id,
        'created_by' => $created_by,
        'name' => $name,
        'type' => $type,
        'breed' => $breed,
        'age' => $age,
        'gender' => $gender,
        'weight' => $weight,
        'size' => $size,
        'allergies' => $allergies,
        'notes' => $notes,
        'category' => $category,
        'photo_path' => $photo_path
    ]));

    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    // Note the correct number of types (13) - "iisssissssss" -> "iisssisssssss"
    $stmt->bind_param("iisssisssssss",
        $user_id,
        $created_by,
        $name,
        $type,
        $breed,
        $age,
        $gender,
        $weight,
        $size,
        $allergies,
        $notes,
        $category,
        $photo_path
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