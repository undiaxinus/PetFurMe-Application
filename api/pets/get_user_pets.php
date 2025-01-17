<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

include_once '../config/Database.php';

$API_BASE_URL = 'http://192.168.1.5'; // Make sure this matches your React Native API_BASE_URL

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get user_id from query parameter
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

    if (!$user_id) {
        throw new Exception("User ID is required");
    }

    // Debug log
    error_log("Fetching pets for user_id: " . $user_id);

    // Fetch pets for the specific user_id
    $query = "SELECT id, name, type, breed, age, gender, weight, size, photo 
             FROM pets 
             WHERE user_id = ?";
             
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    $stmt->bind_param("i", $user_id);
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $pets = array();
        
        while ($row = $result->fetch_assoc()) {
            // Debug log
            error_log("Found pet: " . json_encode($row));
            
            // Handle photo path
            $photoUrl = null;
            if (!empty($row['photo'])) {
                // Construct the full URL to the photo
                $photoUrl = $API_BASE_URL . '/PetFurMe-Application/' . $row['photo'];
            }
            
            $pets[] = array(
                'id' => $row['id'],
                'name' => $row['name'],
                'type' => $row['type'] ?? '',
                'breed' => $row['breed'] ?? '',
                'age' => $row['age'] ?? '',
                'gender' => $row['gender'] ?? '',
                'weight' => $row['weight'] ?? '',
                'size' => $row['size'] ?? '',
                'photo' => $photoUrl // Send the full URL to the image
            );
        }
        
        $stmt->close();
        
        // Debug log
        error_log("Total pets found: " . count($pets));
        
        echo json_encode(array(
            'success' => true,
            'pets' => $pets,
            'user_id' => $user_id // Include user_id in response for verification
        ));
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
} catch(Exception $e) {
    error_log("Error in get_user_pets.php: " . $e->getMessage());
    echo json_encode(array(
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ));
}
?> 