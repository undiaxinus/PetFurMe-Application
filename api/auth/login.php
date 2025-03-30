<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Add detailed error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log access attempt
error_log("Login endpoint accessed at " . date('Y-m-d H:i:s'));

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log the request method
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);

// Verify the database file exists
$dbPath = __DIR__ . '/../config/database.php';
if (!file_exists($dbPath)) {
    echo json_encode([
        'success' => false,
        'error' => 'Database configuration file not found',
        'path_checked' => $dbPath
    ]);
    exit();
}

require_once $dbPath;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request method'
    ]);
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    echo json_encode([
        'success' => false,
        'error' => 'Missing email or password'
    ]);
    exit();
}

try {
    $database = new Database();
    $conn = $database->connect();
    
    // Match the Node.js implementation by checking both email and username
    $email = mysqli_real_escape_string($conn, $data->email);
    
    $query = "SELECT * FROM users WHERE email = ? OR username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $email, $email); // Check both email and username fields
    $stmt->execute();
    
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Use the same password verification as Node.js
        if (password_verify($data->password, $user['password'])) {
            // Match the Node.js response structure exactly
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Invalid password'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'User not found'
        ]);
    }
    
    $stmt->close();
    $conn->close();
    
} catch(Exception $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Login failed. Please try again.'
    ]);
} 