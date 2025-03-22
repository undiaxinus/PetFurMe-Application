<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json");

// Use the correct database include that works in your other files
require_once '../config/database.php';

try {
    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }

    $user_id = $_GET['user_id'];
    
    // Initialize database connection the same way as in fix_photo_data.php
    $database = new Database();
    $db = $database->getConnection();
    
    // Modified to check photo_data first, then fall back to photo
    $query = "SELECT photo, photo_data FROM users WHERE id = ?";
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
        
        // First check for binary data in photo_data
        if ($row['photo_data'] !== null && $row['photo_data'] !== '') {
            // Get the binary data from MEDIUMBLOB
            $blobData = $row['photo_data'];
            error_log("BLOB data length: " . strlen($blobData));
            
            // Convert binary to base64
            $base64Image = base64_encode($blobData);
            error_log("Base64 length: " . strlen($base64Image));
            
            $response = [
                'success' => true,
                'photo' => $base64Image,
                'source' => 'photo_data'
            ];
        } 
        // Fall back to file path in photo column
        else if ($row['photo'] !== null) {
            $response = [
                'success' => true,
                'photo_path' => $row['photo'],
                'source' => 'photo_path'
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'No photo found'
            ];
        }
    } else {
        $response = [
            'success' => false,
            'message' => 'User not found'
        ];
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("Error in get_user_photo: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    // Clean up resources
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($db)) {
        $db->close();
    }
}
?> 