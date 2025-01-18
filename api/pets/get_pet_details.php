<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

include_once '../config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get pet_id from query parameter
    $pet_id = isset($_GET['pet_id']) ? $_GET['pet_id'] : null;

    if (!$pet_id) {
        throw new Exception("Pet ID is required");
    }

    // Fetch pet details
    $query = "SELECT id, name, type, breed, age, gender, weight, size, photo 
             FROM pets 
             WHERE id = ?";
             
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    $stmt->bind_param("i", $pet_id);
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            // Handle photo path
            if (!empty($row['photo'])) {
                $row['photo'] = 'http://192.168.0.110/PetFurMe-Application/' . $row['photo'];
            }
            
            echo json_encode([
                'success' => true,
                'pet' => $row
            ]);
        } else {
            throw new Exception("Pet not found");
        }
        
        $stmt->close();
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
} catch(Exception $e) {
    error_log("Error in get_pet_details.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 