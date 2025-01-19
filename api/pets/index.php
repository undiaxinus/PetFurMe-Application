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

    // Get the JSON data
    $petData = json_decode($_POST['data'], true);
    
    // Handle photo upload
    $photo_path = null;
    if (isset($_POST['photo'])) {
        $base64_string = $_POST['photo'];
        $binary_data = base64_decode($base64_string);
        
        // Generate unique filename
        $new_filename = uniqid() . '.jpg';
        $upload_path = 'uploads/pet_photos/' . $new_filename;
        
        if (file_put_contents($upload_path, $binary_data)) {
            $photo_path = $upload_path;
        } else {
            throw new Exception("Failed to save photo");
        }
    }

    // Prepare the query
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
        "isisssssssiss", // Changed 'b' to 's' for photo path
        $petData['user_id'],
        $petData['name'],
        $petData['age'],
        $petData['type'],
        $petData['breed'],
        $petData['category'],
        $petData['owner_name'],
        $petData['allergies'],
        $petData['notes'],
        $petData['gender'],
        $petData['weight'],
        $photo_path,
        $petData['size']
    );

    if($stmt->execute()) {
        $pet_id = $db->insert_id;
        $stmt->close();
        
        echo json_encode(array(
            'success' => true,
            'message' => 'Pet added successfully',
            'pet_id' => $pet_id,
            'photo_path' => $photo_path
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