<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

require_once __DIR__ . '/../config/database.php';

$API_BASE_URL = 'https://app.petfurme.shop/PetFurMe-Application';

try {
    // Enable detailed error logging
    error_log("Starting get_user_pets.php script");
    error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
    error_log("Query string: " . $_SERVER['QUERY_STRING']);
    
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }
    error_log("Database connected successfully");

    // Get user_id from query parameter
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    error_log("Received user_id: " . ($user_id ?? 'null'));

    if (!$user_id) {
        throw new Exception("User ID is required");
    }

    // First, verify the user exists
    $check_user = "SELECT id FROM users WHERE id = ?";
    $check_stmt = $db->prepare($check_user);
    $check_stmt->bind_param("i", $user_id);
    $check_stmt->execute();
    $user_result = $check_stmt->get_result();
    
    if ($user_result->num_rows === 0) {
        error_log("No user found with ID: $user_id");
        throw new Exception("User not found");
    }
    error_log("User found with ID: $user_id");

    // Now fetch pets
    $query = "SELECT id, name, type, breed, age, gender, weight, 
              photo, photo_data, category,
              allergies, notes, deleted_at, created_at 
              FROM pets 
              WHERE user_id = ? AND deleted_at IS NULL";
              
    error_log("Executing query: " . str_replace('?', $user_id, $query));
    
    $stmt = $db->prepare($query);
    if (!$stmt) {
        error_log("Prepare failed: " . $db->error);
        throw new Exception("Prepare failed: " . $db->error);
    }

    $stmt->bind_param("i", $user_id);
    
    if (!$stmt->execute()) {
        error_log("Execute failed: " . $stmt->error);
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    error_log("Query executed. Found " . $result->num_rows . " rows");
    
    $pets = array();
    
    while ($row = $result->fetch_assoc()) {
        error_log("Processing pet: " . json_encode($row));
        
        // Handle photo data
        if (!empty($row['photo_data'])) {
            $row['photo'] = base64_encode($row['photo_data']);
            $row['photo_type'] = 'base64';
            error_log("Found photo_data for pet " . $row['id']);
        } else if (!empty($row['photo'])) {
            if (!filter_var($row['photo'], FILTER_VALIDATE_URL)) {
                $photo_path = ltrim($row['photo'], '/');
                if (strpos($photo_path, 'PetFurMe-Application/') === 0) {
                    $photo_path = substr($photo_path, strlen('PetFurMe-Application/'));
                }
                $row['photo'] = $API_BASE_URL . '/' . $photo_path;
            }
            $row['photo_type'] = 'url';
            error_log("Found photo URL for pet " . $row['id'] . ": " . $row['photo']);
        } else {
            error_log("No photo found for pet " . $row['id']);
        }
        
        unset($row['photo_data']);
        $pets[] = $row;
    }
    
    $stmt->close();
    
    $response = array(
        'success' => true,
        'pets' => $pets,
        'user_id' => $user_id,
        'debug_info' => [
            'query' => $query,
            'row_count' => $result->num_rows,
            'server_time' => date('Y-m-d H:i:s'),
            'php_version' => PHP_VERSION
        ]
    );
    
    error_log("Sending response: " . json_encode($response));
    echo json_encode($response);
    
} catch(Exception $e) {
    error_log("Error in get_user_pets.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'user_id' => $user_id ?? 'not provided',
        'debug_info' => [
            'error_type' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ));
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($check_stmt)) {
        $check_stmt->close();
    }
    if (isset($db)) {
        $db->close();
    }
}
?> 