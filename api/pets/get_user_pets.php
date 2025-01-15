<?php
// Add this at the top to verify the file is being accessed
file_put_contents('debug.log', 'File accessed at: ' . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

// Prevent any HTML output from error messages
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

// Function to send JSON response
function sendJsonResponse($success, $data, $message = null) {
    $response = ['success' => $success];
    if ($data !== null) $response['data'] = $data;
    if ($message !== null) $response['message'] = $message;
    echo json_encode($response);
    exit;
}

try {
    include_once '../config/Database.php';
    
    if (!isset($_GET['user_id'])) {
        sendJsonResponse(false, null, 'user_id parameter is missing');
    }

    $database = new Database();
    $conn = $database->connect();
    
    if (!$conn) {
        sendJsonResponse(false, null, 'Database connection failed');
    }

    $user_id = mysqli_real_escape_string($conn, $_GET['user_id']);
    
    // Log for debugging
    error_log("Processing request for user_id: " . $user_id);
    
    $query = "SELECT id, name, photo FROM pets WHERE user_id = '$user_id'";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        sendJsonResponse(false, null, 'Query failed: ' . mysqli_error($conn));
    }
    
    $pets = [];
    while($row = mysqli_fetch_assoc($result)) {
        $pets[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'photo' => $row['photo']
        ];
    }
    
    sendJsonResponse(true, ['pets' => $pets]);

} catch (Exception $e) {
    error_log("Error in get_user_pets.php: " . $e->getMessage());
    sendJsonResponse(false, null, $e->getMessage());
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
}
?> 