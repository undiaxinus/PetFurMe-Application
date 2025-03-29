<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log the current directory and file paths for debugging
error_log("Current script path: " . __FILE__);
error_log("Document root: " . $_SERVER['DOCUMENT_ROOT']);

// Try multiple possible paths to find the database.php file
$possible_paths = [
    __DIR__ . '/../../config/database.php',
    __DIR__ . '/../config/database.php',
    $_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/config/database.php',
    $_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/config/database.php'
];

$database_path = null;
foreach ($possible_paths as $path) {
    error_log("Checking path: " . $path);
    if (file_exists($path)) {
        $database_path = $path;
        error_log("Found database.php at: " . $path);
        break;
    }
}

if (!$database_path) {
    error_log("Could not find database.php in any of the checked paths");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database configuration file not found'
    ]);
    exit;
}

// Include database connection
require_once $database_path;

try {
    // Get JSON data
    $data = json_decode(file_get_contents('php://input'), true);
    error_log("Received registration data: " . json_encode($data));
    
    // Check if request has required fields
    if (!isset($data['email']) || !isset($data['username']) || !isset($data['password'])) {
        throw new Exception('Email, username and password are required');
    }

    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $username = trim($data['username']);
    $password = $data['password'];
    $role = isset($data['role']) ? trim($data['role']) : 'pet_owner';
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Create database connection
    $database = new Database();
    $conn = $database->connect();
    
    // Check if email already exists
    $check_query = "SELECT COUNT(*) as count FROM users WHERE email = ?";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("s", $email);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $row = $result->fetch_assoc();
    
    if ($row['count'] > 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Email already registered'
        ]);
        exit;
    }
    
    // Insert user
    $query = "INSERT INTO users (email, username, password, role, created_at) VALUES (?, ?, ?, ?, NOW())";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ssss", $email, $username, $hashed_password, $role);
    $result = $stmt->execute();
    
    if ($result) {
        // Get the user ID
        $user_id = $conn->insert_id;
        
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'user_id' => $user_id
        ]);
    } else {
        throw new Exception('Failed to register user: ' . $conn->error);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    // Log the error
    error_log("Error in register.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 