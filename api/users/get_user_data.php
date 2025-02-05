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

    if (!$user_id) {
        throw new Exception("User ID is required");
    }

    // Debug log
    error_log("Fetching user data for user_id: " . $user_id);

    // Updated query to include photo and role
    $query = "SELECT username, name, email, phone, age, store_address, photo, role, email_verified_at FROM users WHERE id = ?";
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
        
        // Handle photo path
        $photoUrl = null;
        if ($row['photo'] !== null && $row['photo'] !== '') {
            // Check if it's already a full URL
            if (!filter_var($row['photo'], FILTER_VALIDATE_URL)) {
                // Handle different path formats
                if (strpos($row['photo'], 'uploads/') === 0) {
                    $photoUrl = $API_BASE_URL . '/PetFurMe-Application/' . $row['photo'];
                } else if (strpos($row['photo'], '/uploads/') === 0) {
                    $photoUrl = $API_BASE_URL . '/PetFurMe-Application' . $row['photo'];
                } else {
                    $photoUrl = $API_BASE_URL . '/PetFurMe-Application/uploads/' . basename($row['photo']);
                }
                
                // Verify file exists
                $absolute_path = UPLOADS_ABSOLUTE_PATH . '/' . basename($row['photo']);
                if (file_exists($absolute_path)) {
                    $response['profile']['photo'] = $photoUrl;
                } else {
                    error_log("Photo file not found at: " . $absolute_path);
                    $response['profile']['photo'] = null;
                }
            } else {
                $response['profile']['photo'] = $row['photo'];
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
                'photo' => $photoUrl,
                'role' => $row['role'],
                'email_verified_at' => $row['email_verified_at'],
                'has_photo' => $photoUrl !== null
            ]
        ];
        
        echo json_encode($response);
    } else {
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