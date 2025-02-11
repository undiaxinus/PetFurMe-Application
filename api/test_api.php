<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_log("test_api.php script started");

try {
    $response = [
        'success' => true,
        'message' => 'API is accessible',
        'timestamp' => date('Y-m-d H:i:s'),
        'server_info' => [
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'],
            'request_method' => $_SERVER['REQUEST_METHOD'],
            'request_uri' => $_SERVER['REQUEST_URI'],
            'remote_addr' => $_SERVER['REMOTE_ADDR']
        ]
    ];
    
    error_log("API test successful: " . json_encode($response));
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("API test error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'API test failed: ' . $e->getMessage()
    ]);
}
?> 