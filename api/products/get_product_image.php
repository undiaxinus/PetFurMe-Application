<?php
header('Access-Control-Allow-Origin: *');
require_once '../config/database.php';
require_once '../config/constants.php';

function writeLog($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents(PRODUCT_LOG, $logMessage, FILE_APPEND);
}

if (isset($_GET['id'])) {
    $product_id = $_GET['id'];
    writeLog("Fetching image for product ID: " . $product_id);
    
    try {
        $database = new Database();
        $conn = $database->connect();
        
        $stmt = $conn->prepare("SELECT product_image FROM products WHERE id = ?");
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc() && !empty($row['product_image'])) {
            $image_path = 'D:/XAMPP/htdocs/PetFurMe-Application/' . $row['product_image'];
            writeLog("Looking for image at: " . $image_path);
            
            if (file_exists($image_path)) {
                $mime_type = mime_content_type($image_path);
                writeLog("Found image, serving with mime type: " . $mime_type);
                header('Content-Type: ' . $mime_type);
                readfile($image_path);
                exit;
            } else {
                writeLog("Image file not found at: " . $image_path);
            }
        }
        
        writeLog("No valid image found for product ID: " . $product_id);
        
    } catch (Exception $e) {
        writeLog("ERROR: " . $e->getMessage());
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Failed to fetch image']);
    }
}

// If no image found or error, return a 404
header('HTTP/1.0 404 Not Found');
?> 