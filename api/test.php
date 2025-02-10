<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

echo json_encode([
    'status' => 'ok',
    'message' => 'API is working',
    'server_time' => date('Y-m-d H:i:s'),
    'remote_addr' => $_SERVER['REMOTE_ADDR']
]);
?> 