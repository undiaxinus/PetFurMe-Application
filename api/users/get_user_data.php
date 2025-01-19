<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');
header('Cache-Control: public, max-age=3600');

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
        
        // Handle BLOB photo data
        $photoBase64 = null;
        if ($row['photo'] !== null && $row['photo'] !== '') {
            try {
                $binaryData = $row['photo'];
                
                // If it's a file path (starts with 'uploads/')
                if (is_string($binaryData) && (strpos($binaryData, 'uploads/') === 0)) {
                    // Fix the path resolution
                    $fullPath = dirname(dirname(__DIR__)) . '/' . $binaryData;
                    if (file_exists($fullPath)) {
                        $photoBase64 = base64_encode(file_get_contents($fullPath));
                        error_log("Loading image from file: " . $fullPath);
                    } else {
                        error_log("File not found: " . $fullPath);
                        $photoBase64 = null;
                    }
                } else {
                    // It's binary data from the BLOB
                    $photoBase64 = base64_encode($binaryData);
                }
                
                // Validate the base64 string
                if ($photoBase64 !== null && base64_decode($photoBase64, true) !== false) {
                    error_log("Valid base64 image data, length: " . strlen($photoBase64));
                    // Return the complete data URI
                    $photoBase64 = 'data:image/jpeg;base64,' . $photoBase64;
                } else {
                    error_log("Invalid base64 encoding");
                    $photoBase64 = null;
                }
            } catch (Exception $e) {
                error_log("Error processing image: " . $e->getMessage());
                $photoBase64 = null;
            }
        } else {
            $photoBase64 = null;
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
                'photo' => $photoBase64,
                'role' => $row['role'],
                'email_verified_at' => $row['email_verified_at'],
                'has_photo' => $photoBase64 !== null
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