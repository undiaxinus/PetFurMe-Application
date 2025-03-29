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

// Include the direct mailer helper
require_once __DIR__ . '/../helpers/mailer_direct.php';

// Log that the script has started
error_log("Send-OTP endpoint started - " . date('Y-m-d H:i:s'));

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);
error_log("Received data: " . json_encode($data));

try {
    // Check if request has email
    if (!isset($data['email']) || empty($data['email'])) {
        throw new Exception('Email is required');
    }

    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    if (!$email) {
        throw new Exception('Invalid email format');
    }

    error_log("Processing email: $email");
    
    // Create database connection
    $database = new Database();
    $conn = $database->connect();
    error_log("Database connection established");
    
    // Generate 6-digit OTP
    $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    error_log("Generated OTP: $otp");
    
    // Store OTP in database
    $query = "INSERT INTO password_resets (email, otp, created_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW()";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sss", $email, $otp, $otp);
    $stmt->execute();
    error_log("OTP stored in database");

    // Email content
    $subject = "Your VetCare Verification Code";
    $message = "Your verification code is: $otp\n\nThis code will expire in 10 minutes.";
    
    // Send email using the mailer function
    $result = sendMail($email, $subject, $message);
    
    if ($result['success']) {
        echo json_encode([
            'success' => true,
            'message' => 'OTP sent successfully'
        ]);
    } else {
        throw new Exception($result['error']);
    }

    if (isset($stmt)) {
        $stmt->close();
    }
    $conn->close();
    
} catch (Exception $e) {
    // Log the error
    error_log("Error in send-otp.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug_info' => [
            'file' => __FILE__,
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]
    ]);
}
?> 