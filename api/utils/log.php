<?php
header("Access-Control-Allow-Origin: http://localhost:8081");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");
header("Access-Control-Allow-Credentials: true");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error reporting first
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/server.log');

// Log the request details
error_log("Request received at: " . date('Y-m-d H:i:s'));
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request headers: " . json_encode(getallheaders()));

require_once '../cors-config.php';
setCorsHeaders();

// Ensure the log directory exists with proper permissions
$logDir = __DIR__;
if (!is_dir($logDir)) {
    if (!mkdir($logDir, 0777, true)) {
        error_log("Failed to create log directory: " . $logDir);
    }
    chmod($logDir, 0777);
}

// Create and set permissions for the log file
$logFile = $logDir . '/client.log';
if (!file_exists($logFile)) {
    if (!touch($logFile)) {
        error_log("Failed to create log file: " . $logFile);
    }
    chmod($logFile, 0666);
}

try {
    // Get and log the raw input
    $rawInput = file_get_contents('php://input');
    error_log("Raw input received: " . $rawInput);

    // Decode JSON data
    $logData = json_decode($rawInput, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON decode error: ' . json_last_error_msg());
    }

    if (!$logData) {
        throw new Exception('No log data received');
    }

    // Format the log entry
    $timestamp = date('Y-m-d H:i:s');
    $level = $logData['level'] ?? 'INFO';
    $message = $logData['message'] ?? '';
    $data = isset($logData['data']) ? json_encode($logData['data']) : '';
    
    $logEntry = "[{$timestamp}] [{$level}] {$message}" . ($data ? " Data: {$data}" : "") . PHP_EOL;

    // Attempt to write to log file
    if (file_put_contents($logFile, $logEntry, FILE_APPEND) === false) {
        throw new Exception('Failed to write to log file');
    }

    // Send success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Log entry saved successfully'
    ]);

} catch (Exception $e) {
    error_log("Logging error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to save log entry: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?> 