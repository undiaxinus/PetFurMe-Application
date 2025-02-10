<?php
// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/login_debug.log');

// Log request details
error_log("=== New Login Request ===");
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request Headers: " . print_r(getallheaders(), true));
error_log("Raw Input: " . file_get_contents('php://input'));

// Include the main CORS and error handling first
require_once '../index.php';

// Include database connection
require_once '../config/Database.php';

// Log CORS headers being sent
error_log("Response Headers: " . print_r(headers_list(), true));

// Only set content type
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false, 
        "error" => "Method not allowed",
        "method" => $_SERVER['REQUEST_METHOD']
    ]);
    exit();
}

try {
    // Get raw input and decode JSON
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    
    error_log("Raw request data: " . $rawData);
    error_log("Parsed request data: " . print_r($data, true));
    
    // Validate input
    if (!$data || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid request data'
        ]);
        exit();
    }

    $email = $data['email'];
    $password = $data['password'];

    error_log("Attempting login for email: " . $email);
    
    // Database connection
    $database = new Database();
    $db = $database->getConnection();
    error_log("Database connection successful");

    // Query user
    $query = "SELECT id, password FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        error_log("No user found for email: " . $email);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid email or password'
        ]);
        exit();
    }

    error_log("Found user with ID: " . $user['id']);
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        error_log("Password verified successfully for user ID: " . $user['id']);
        echo json_encode([
            'success' => true,
            'user_id' => $user['id'],
            'message' => 'Login successful'
        ]);
    } else {
        error_log("Password verification failed for user ID: " . $user['id']);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid email or password'
        ]);
    }

} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'debug' => $e->getMessage()
    ]);
}
?>