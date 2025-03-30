<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../config/database.php';

try {
    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }

    $user_id = $_GET['user_id'];
    error_log("Processing photo request for user_id: " . $user_id);
    
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    // First, let's check if the user exists and what type of photo they have
    $checkQuery = "SELECT photo, photo_data FROM users WHERE id = ?";
    $checkStmt = $db->prepare($checkQuery);
    
    if (!$checkStmt) {
        throw new Exception("Prepare check failed: " . $db->error);
    }
    
    $checkStmt->bind_param("i", $user_id);
    
    if (!$checkStmt->execute()) {
        throw new Exception("Execute check failed: " . $checkStmt->error);
    }
    
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        $userData = $checkResult->fetch_assoc();
        error_log("User found. Photo path: " . ($userData['photo'] ?? 'null') . 
                  ", Photo data length: " . (strlen($userData['photo_data'] ?? '') ?? 0));
        
        // If we have photo_data, use it
        if (!empty($userData['photo_data'])) {
            $base64Image = base64_encode($userData['photo_data']);
            error_log("Using photo_data. Base64 length: " . strlen($base64Image));
            
            echo json_encode([
                'success' => true,
                'photo' => $base64Image,
                'source' => 'photo_data'
            ]);
        }
        // If we have a photo path but no photo_data, we should migrate it
        else if (!empty($userData['photo'])) {
            error_log("Found photo path, attempting to migrate to photo_data");
            
            // Get the full path to the photo
            $photoPath = $_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/uploads/' . $userData['photo'];
            error_log("Full photo path: " . $photoPath);
            
            if (file_exists($photoPath)) {
                $imageData = file_get_contents($photoPath);
                if ($imageData !== false) {
                    // Update the database with the binary data
                    $updateQuery = "UPDATE users SET photo_data = ? WHERE id = ?";
                    $updateStmt = $db->prepare($updateQuery);
                    $updateStmt->bind_param("si", $imageData, $user_id);
                    
                    if ($updateStmt->execute()) {
                        error_log("Successfully migrated photo to photo_data");
                        $base64Image = base64_encode($imageData);
                        echo json_encode([
                            'success' => true,
                            'photo' => $base64Image,
                            'source' => 'photo_data'
                        ]);
                    } else {
                        throw new Exception("Failed to update photo_data");
                    }
                    $updateStmt->close();
                } else {
                    throw new Exception("Failed to read photo file");
                }
            } else {
                error_log("Photo file not found at: " . $photoPath);
                echo json_encode([
                    'success' => false,
                    'message' => 'Photo file not found'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No photo data found'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Error in get_user_photo: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($checkStmt)) {
        $checkStmt->close();
    }
    if (isset($db)) {
        $db->close();
    }
}
?> 