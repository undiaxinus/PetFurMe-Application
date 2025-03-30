<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With, Cache-Control, Pragma');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';

try {
    // Get database connection
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get user_id from GET or POST
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : 
              (isset($_POST['user_id']) ? $_POST['user_id'] : null);

    // Debug log for user_id
    error_log("Received request for user_id: " . $user_id);

    if (!$user_id) {
        throw new Exception("User ID is required");
    }

    // Updated query to include all necessary fields
    $query = "SELECT id, uuid, username, name, email, phone, age, address, store_address, photo, photo_data, role, email_verified_at, verified_by FROM users WHERE id = ?";
    
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
        
        // Convert blob to base64
        $photo_data = null;
        if ($row['photo_data']) {
            $photo_data = base64_encode($row['photo_data']);
            error_log("Found photo_data in database, length: " . strlen($photo_data));
        } else {
            error_log("No photo_data found in database");
        }
        
        $response = [
            'success' => true,
            'profile' => [
                'id' => $row['id'],
                'uuid' => $row['uuid'],
                'username' => $row['username'],
                'name' => $row['name'],
                'email' => $row['email'],
                'phone' => $row['phone'],
                'age' => $row['age'],
                'address' => $row['address'],
                'photo' => $row['photo'],
                'role' => $row['role'] ?? 'pet_owner',
                'email_verified_at' => $row['email_verified_at'],
                'verified_by' => $row['verified_by'],
                'is_verified' => $row['verified_by'] !== null,
                'photo_data' => $photo_data  // Include the base64 encoded photo
            ]
        ];
        
        // Debug log for final response
        error_log("Final response data: " . json_encode($response));
        
        error_log("Sending response: " . json_encode($response));
        
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