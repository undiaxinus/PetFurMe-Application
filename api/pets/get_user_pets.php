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

    // Fetch pets with BLOB data
    $query = "SELECT id, name, type, breed, age, gender, weight, size, photo, allergies, notes, deleted_at 
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
            if (!empty($row['photo'])) {
                try {
                    // Get the file path from database
                    $photo_path = $row['photo'];
                    
                    // Get the absolute server path to verify file exists
                    $absolute_path = $_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/' . $photo_path;
                    error_log("Checking file at: " . $absolute_path);
                    
                    if (file_exists($absolute_path)) {
                        // Fix: Remove 'api/pets/' from the URL construction
                        $photoUrl = $API_BASE_URL . '/PetFurMe-Application/' . $photo_path;
                        error_log("Photo URL created: " . $photoUrl);
                    } else {
                        error_log("Photo file not found at: " . $absolute_path);
                        error_log("Database photo path: " . $photo_path);
                    }
                    
                } catch (Exception $e) {
                    error_log("Error processing photo for " . $row['name'] . ": " . $e->getMessage());
                }
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
                'photo' => $photoUrl,
                'allergies' => $row['allergies'] ?? '',
                'notes' => $row['notes'] ?? ''
            );
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