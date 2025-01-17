<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

include_once '../config/Database.php';

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

    // Updated query to include email_verified_at
    $query = "SELECT username, name, email, phone, age, store_address, photo, email_verified_at FROM users WHERE id = ?";
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
        
        $response = [
            'success' => true,
            'profile' => [
                'username' => $row['username'],
                'name' => $row['name'],
                'email' => $row['email'],
                'phone' => $row['phone'],
                'age' => $row['age'],
                'address' => $row['store_address'],
                'hasPhoto' => !empty($row['photo']),
                'email_verified_at' => $row['email_verified_at']
            ]
        ];
    } else {
        throw new Exception("User not found");
    }

    echo json_encode($response);

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