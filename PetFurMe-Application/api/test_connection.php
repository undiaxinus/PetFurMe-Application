<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'server_info' => [
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'],
            'document_root' => $_SERVER['DOCUMENT_ROOT'],
            'script_filename' => $_SERVER['SCRIPT_FILENAME']
        ]
    ]);
} catch (Exception $e) {
    error_log("Connection test failed: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Connection test failed',
        'error' => $e->getMessage()
    ]);
}
?> 