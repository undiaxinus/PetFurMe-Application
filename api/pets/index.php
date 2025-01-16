<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

include_once '../config/Database.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Debug: Log received data
error_log("Received pet creation request: " . print_r($data, true));

try {
    $database = new Database();
    $db = $database->connect();

    // Add error handling for database connection
    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Store values in variables first
    $user_id = $data->user_id;
    $name = htmlspecialchars(strip_tags($data->name));
    $age = $data->age;
    $type = htmlspecialchars(strip_tags($data->type));
    $breed = htmlspecialchars(strip_tags($data->breed));
    $category = htmlspecialchars(strip_tags($data->category));
    $owner_name = null;
    $allergies = property_exists($data, 'allergies') ? htmlspecialchars(strip_tags($data->allergies)) : null;
    $notes = property_exists($data, 'notes') ? htmlspecialchars(strip_tags($data->notes)) : null;
    $gender = htmlspecialchars(strip_tags($data->gender));
    $weight = $data->weight;
    $photo = null;
    $size = property_exists($data, 'size') ? htmlspecialchars(strip_tags($data->size)) : null;

    $query = "INSERT INTO pets 
            (user_id, name, age, type, breed, category, owner_name, allergies, notes, gender, weight, photo, size, created_at, updated_at) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    // Bind parameters
    $stmt->bind_param(
        "isisssssssiss",
        $user_id,
        $name,
        $age,
        $type,
        $breed,
        $category,
        $owner_name,
        $allergies,
        $notes,
        $gender,
        $weight,
        $photo,
        $size
    );

    if($stmt->execute()) {
        $pet_id = $db->insert_id;
        $stmt->close();
        
        echo json_encode(array(
            'success' => true,
            'message' => 'Pet added successfully',
            'pet_id' => $pet_id
        ));
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
} catch(Exception $e) {
    error_log("Database Error: " . $e->getMessage());
    echo json_encode(array(
        'success' => false,
        'message' => 'Database Error',
        'error' => $e->getMessage()
    ));
}
?> 