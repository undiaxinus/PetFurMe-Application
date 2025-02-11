<?php
// Include CORS headers first - must be before any output or error handling
require_once '../cors-config.php';
require_once '../utils/logger.php';

// Initialize logger
Logger::init('login');

// Now enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/login_debug.log');

// Remove any other CORS-related includes or headers

// Include database connection
require_once '../config/Database.php';

// Log the start of login process
Logger::info("=== New Login Request ===", [
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'unknown'
]);

// Only set content type after CORS headers
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
    
    Logger::debug("Received login data", [
        'email' => $data['email'] ?? 'not provided',
        'passwordProvided' => isset($data['password']),
        'rawData' => $rawData
    ]);
    
    // Validate input
    if (!$data || !isset($data['email']) || !isset($data['password'])) {
        Logger::warn("Invalid login data provided", ['data' => $data]);
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid request data'
        ]);
        exit();
    }

    $email = $data['email'];
    $password = $data['password'];

    // Database connection
    $database = new Database();
    $db = $database->getConnection();
    Logger::info("Database connection established");

    // Query user
    $query = "SELECT id, password FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    Logger::debug("Executing user query", ['email' => $email]);
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        Logger::warn("Login failed - User not found", ['email' => $email]);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid email or password'
        ]);
        exit();
    }

    Logger::info("User found", ['user_id' => $user['id']]);
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        Logger::info("Login successful", ['user_id' => $user['id']]);
        echo json_encode([
            'success' => true,
            'user_id' => $user['id'],
            'message' => 'Login successful'
        ]);
    } else {
        Logger::warn("Login failed - Invalid password", ['user_id' => $user['id']]);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid email or password'
        ]);
    }

} catch (Exception $e) {
    Logger::error("Login error", [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'debug' => $e->getMessage()
    ]);
}
?>