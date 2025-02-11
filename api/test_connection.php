<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/connection_test.log');

try {
    echo json_encode([
        'success' => true,
        'message' => 'API is accessible',
        'timestamp' => date('Y-m-d H:i:s'),
        'server_info' => [
            'request_uri' => $_SERVER['REQUEST_URI'],
            'http_host' => $_SERVER['HTTP_HOST'],
            'remote_addr' => $_SERVER['REMOTE_ADDR']
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 