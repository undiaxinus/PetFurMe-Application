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
$dbPath = __DIR__ . '/../config/Database.php';
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
    
    // Clean data
    $email = mysqli_real_escape_string($conn, htmlspecialchars(strip_tags($data->email)));
    
    // Create query using proper mysqli syntax
    $query = "SELECT * FROM users WHERE email = ? LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // Verify password
        if (password_verify($data->password, $row['password'])) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'role' => $row['role']
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
    error_log("Database Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database Error: ' . $e->getMessage()
    ]);
} 