<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Accept');

// Prevent output buffering issues
ob_clean();

try {
    $diagnostics = [
        'server_info' => [
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
        ],
        'database_status' => 'Connected', // You can add actual DB check here
        'php_config' => [
            'mail_enabled' => function_exists('mail'),
            'max_execution_time' => ini_get('max_execution_time'),
            'upload_max_filesize' => ini_get('upload_max_filesize')
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ];

    $response = [
        'success' => true,
        'data' => $diagnostics
    ];

    // Debug output
    error_log('Diagnose.php response: ' . json_encode($response));
    
    echo json_encode($response);
    exit;
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    exit;
}
?> 