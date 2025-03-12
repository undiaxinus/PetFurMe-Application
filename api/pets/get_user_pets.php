<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

require_once __DIR__ . '/../config/Database.php';

$API_BASE_URL = 'http://192.168.224.1'; // Make sure this matches your React Native API_BASE_URL

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

    // Fetch pets with BLOB data
    $query = "SELECT id, name, type, breed, age, gender, weight, size, 
              CASE 
                  WHEN photo_data IS NOT NULL THEN TO_BASE64(photo_data)
                  ELSE NULL 
              END as photo_base64,
              allergies, notes, deleted_at 
              FROM pets 
              WHERE user_id = ? AND deleted_at IS NULL";
              
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    $stmt->bind_param("i", $user_id);
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $pets = array();
        
        error_log("Found " . $result->num_rows . " active pets");
        
        while ($row = $result->fetch_assoc()) {
            error_log("Processing pet: " . json_encode($row));
            
            // Handle photo
            $photoUrl = null;
            if (!empty($row['photo_base64'])) {
                $row['photo'] = 'data:image/jpeg;base64,' . $row['photo_base64'];
                unset($row['photo_base64']); // Remove the raw base64 from response
            }
            
            $pets[] = $row;
        }
        
        $stmt->close();
        error_log("Total pets found: " . count($pets));
        
        echo json_encode(array(
            'success' => true,
            'pets' => $pets,
            'user_id' => $user_id
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