<?php
// Prevent any output before headers
ob_start();

// Enable error reporting and logging
ini_set('display_errors', 1);
error_reporting(E_ALL);
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../../error.log');

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Log request details
error_log("=== New Request to check_profile_status.php ===");
error_log("Request URI: " . $_SERVER['REQUEST_URI']);
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("User ID: " . ($_GET['user_id'] ?? 'not set'));

// Include the centralized Logger at the top
require_once __DIR__ . '/../utils/Logger.php';

try {
    // Clear any buffered output
    ob_clean();

    // Check if Database.php exists
    $dbPath = __DIR__ . '/../config/Database.php';
    if (!file_exists($dbPath)) {
        throw new Exception("Database configuration file not found at: " . $dbPath);
    }

    // Include database configuration
    require_once $dbPath;
    error_log("Database config loaded successfully from: " . $dbPath);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed');
    }

    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }

    $user_id = $_GET['user_id'];
    error_log("Processing request for user_id: " . $user_id);

    // Test database connection with better error handling
    try {
        $database = new Database();
        $db = $database->connect();
        
        if (!$db) {
            throw new Exception("Database connection failed");
        }
        error_log("Database connection established successfully");

        // Verify the users table exists
        $table_check = $db->query("SHOW TABLES LIKE 'users'");
        if ($table_check->num_rows === 0) {
            throw new Exception("Users table does not exist");
        }
        
        // Add table structure check
        $structure_check = $db->query("DESCRIBE users");
        if (!$structure_check) {
            throw new Exception("Failed to check users table structure");
        }
        
        $required_columns = ['id', 'name', 'email', 'phone', 'photo', 'role'];
        $existing_columns = [];
        while ($row = $structure_check->fetch_assoc()) {
            $existing_columns[] = $row['Field'];
        }
        
        $missing_columns = array_diff($required_columns, $existing_columns);
        if (!empty($missing_columns)) {
            throw new Exception("Missing required columns: " . implode(', ', $missing_columns));
        }
    } catch (Exception $e) {
        error_log("ERROR in check_profile_status.php: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage(),
            'debug_info' => [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]
        ]);
        exit();
    }

    // Rest of your existing code...
    $check_query = "SELECT COUNT(*) as count FROM users WHERE id = ?";
    $check_stmt = $db->prepare($check_query);
    
    if (!$check_stmt) {
        throw new Exception("Failed to prepare check statement: " . $db->error);
    }
    
    $check_stmt->bind_param("i", $user_id);
    
    if (!$check_stmt->execute()) {
        throw new Exception("Failed to execute check statement: " . $check_stmt->error);
    }
    
    $check_result = $check_stmt->get_result();
    $count = $check_result->fetch_assoc()['count'];
    error_log("User count check completed: " . $count);
    
    if ($count === 0) {
        error_log("User not found: " . $user_id);
        echo json_encode([
            'success' => false,
            'message' => 'User not found',
            'user_id' => $user_id
        ]);
        exit();
    }

    // Get profile details
    $query = "SELECT name, email, phone, photo, complete_credentials, verified_by 
              FROM users 
              WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Failed to prepare profile statement: " . $db->error);
    }
    
    $stmt->bind_param("i", $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to execute profile statement: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    error_log("Profile data retrieved: " . json_encode([
        'name' => $row['name'] ?? null,
        'email' => $row['email'] ?? null,
        'phone' => $row['phone'] ?? null,
        'hasPhoto' => !empty($row['photo']),
        'complete_credentials' => $row['complete_credentials']
    ]));
    
    $isComplete = !empty($row['name']) && 
                 !empty($row['email']) && 
                 !empty($row['phone']) && 
                 !empty($row['photo']);
    
    error_log("Profile complete status: " . ($isComplete ? 'true' : 'false'));
    
    // Add more detailed logging
    error_log("Checking profile status for user: " . $user_id);
    error_log("Raw row data: " . json_encode($row));
    error_log("Complete credentials value: " . $row['complete_credentials']);
    
    $response = [
        'success' => true,
        'isProfileComplete' => $isComplete,
        'user_id' => $user_id,
        'profile' => [
            'name' => $row['name'] ?? null,
            'email' => $row['email'] ?? null,
            'phone' => $row['phone'] ?? null,
            'hasPhoto' => !empty($row['photo']),
            'photo' => $row['photo'] ?? null,
            'complete_credentials' => (int)$row['complete_credentials'],
            'verified_by' => $row['verified_by'] ?? null
        ]
    ];
    
    error_log("Sending success response: " . json_encode($response));
    echo json_encode($response);

    // Instead of error_log or custom debug functions, use:
    Logger::info("Checking profile status for user ID: " . $user_id);
    
    // Debug information only when needed
    if (DEBUG_ENABLED) {
        Logger::debug("Profile data:", $response);
    }
    
} catch (Exception $e) {
    Logger::error("Exception in profile check", [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    // Ensure clean output buffer
    ob_clean();
    
    // Set headers if not already sent
    if (!headers_sent()) {
        header('Content-Type: application/json');
        http_response_code(500);
    }
    
    $errorResponse = [
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage(),
        'debug_info' => [
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ];
    
    error_log("Sending error response: " . json_encode($errorResponse));
    echo json_encode($errorResponse);
} finally {
    if (isset($check_stmt)) {
        $check_stmt->close();
    }
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($db)) {
        $db->close();
    }
}

// End output buffer
ob_end_flush();
?> 