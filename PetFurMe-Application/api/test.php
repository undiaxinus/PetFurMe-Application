<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

error_log("Test script executed at: " . date('Y-m-d H:i:s'));
error_log("Full script path: " . __FILE__);
error_log("Document root: " . $_SERVER['DOCUMENT_ROOT']);
error_log("Request URI: " . $_SERVER['REQUEST_URI']);
error_log("Server software: " . $_SERVER['SERVER_SOFTWARE']);
error_log("PHP version: " . PHP_VERSION);

try {
    // Test database connection
    require_once __DIR__ . '/../config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        error_log("Database connection successful");
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'API endpoint is accessible',
        'server_info' => [
            'script_path' => __FILE__,
            'document_root' => $_SERVER['DOCUMENT_ROOT'],
            'request_uri' => $_SERVER['REQUEST_URI'],
            'server_software' => $_SERVER['SERVER_SOFTWARE'],
            'php_version' => PHP_VERSION,
            'database_connected' => ($conn ? true : false)
        ]
    ]);
} catch (Exception $e) {
    error_log("Test script error: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 