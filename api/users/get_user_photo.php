<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json");

include '../db_connection.php';

try {
    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }

    $user_id = $_GET['user_id'];
    
    // Specifically handle BLOB data
    $query = "SELECT photo FROM users WHERE id = ?";
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
        if ($row['photo'] !== null) {
            // Get the raw BLOB data
            $blobData = $row['photo'];
            
            // Convert BLOB to base64
            $base64Image = base64_encode($blobData);
            
            $response = [
                'success' => true,
                'photo' => $base64Image
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
}
?> 