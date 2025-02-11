<?php
require_once __DIR__ . '/../utils/Logger.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With, Cache-Control, Pragma');

// Set up specific logging for user operations
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/user_debug.log');

function logUserDebug($message, $data = null) {
    $log = "[" . date('Y-m-d H:i:s') . "] " . $message;
    if ($data) {
        $log .= " - Data: " . json_encode($data);
    }
    error_log($log);
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/Database.php';
include_once '../config/constants.php';

try {
    Logger::info('UserAPI', 'get_user_data.php script started');
    Logger::debug('UserAPI', 'Request method: ' . $_SERVER['REQUEST_METHOD']);
    Logger::debug('UserAPI', 'GET parameters:', $_GET);
    Logger::debug('UserAPI', 'Request URI:', $_SERVER['REQUEST_URI']);
    
    // Get database connection
    $database = new Database();
    $db = $database->connect();
    Logger::info('UserAPI', 'Database connection established');

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get user_id from GET or POST
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : 
              (isset($_POST['user_id']) ? $_POST['user_id'] : null);
    Logger::debug('UserAPI', 'Requested user_id:', $user_id);

    if (!$user_id) {
        throw new Exception("User ID is required");
    }

    // Updated query to include all necessary fields
    $query = "SELECT id, uuid, username, name, email, phone, age, address, store_address, photo, role, email_verified_at FROM users WHERE id = ?";
    
    // Debug log for query
    Logger::debug('UserAPI', 'Executing query:', $query);

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
        Logger::debug('UserAPI', 'Raw data from database:', $row);
        
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
                'email_verified_at' => $row['email_verified_at']
            ]
        ];
        
        // Debug log for final response
        Logger::debug('UserAPI', 'Final response data:', $response);
        
        echo json_encode($response);
    } else {
        Logger::info('UserAPI', 'No user found for ID: ' . $user_id);
        throw new Exception("User not found");
    }

} catch (Exception $e) {
    Logger::error('UserAPI', 'Error occurred:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
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