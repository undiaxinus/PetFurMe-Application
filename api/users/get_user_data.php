<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');
header('Cache-Control: public, max-age=3600');

include_once '../config/Database.php';
include_once '../config/constants.php';

try {
    // Get database connection
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get user_id from query parameter
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

    // Debug log for user_id
    error_log("Attempting to fetch data for user_id: " . $user_id);

    if (!$user_id) {
        throw new Exception("User ID is required");
    }

    // Updated query to include photo and role
    $query = "SELECT username, name, email, phone, age, store_address, photo, role, email_verified_at FROM users WHERE id = ?";
    
    // Debug log for query
    error_log("Executing query: " . $query);

    $stmt = $db->prepare($query);

    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    $stmt->bind_param("i", $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // Debug log for raw data
        error_log("Raw data from database: " . json_encode($row));
        
        // Handle photo path
        $photoUrl = null;
        if ($row['photo'] !== null && $row['photo'] !== '') {
            error_log("Photo value from database: " . $row['photo']);
            
            // Check if it's already a full URL
            if (!filter_var($row['photo'], FILTER_VALIDATE_URL)) {
                error_log("Photo is not a URL, constructing path...");
                
                $photoUrl = $row['photo'];  // Use the raw photo value
                error_log("Constructed photoUrl: " . $photoUrl);
            } else {
                $photoUrl = $row['photo'];
                error_log("Using original photo URL: " . $photoUrl);
            }
        }
        
        $response = [
            'success' => true,
            'profile' => [
                'username' => $row['username'],
                'name' => $row['name'],
                'email' => $row['email'],
                'phone' => $row['phone'],
                'age' => $row['age'],
                'address' => $row['store_address'],
                'photo' => $photoUrl,  // Use the photoUrl we constructed
                'role' => $row['role'] ?: 'pet_owner',
                'email_verified_at' => $row['email_verified_at']
            ]
        ];
        
        // Debug log for final response
        error_log("Final response data: " . json_encode($response));
        
        echo json_encode($response);
    } else {
        error_log("No user found for ID: " . $user_id);
        throw new Exception("User not found");
    }

} catch (Exception $e) {
    error_log("Error in get_user_data.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($db)) {
        $db->close();
    }
}
?> 