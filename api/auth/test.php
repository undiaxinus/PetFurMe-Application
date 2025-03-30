<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'message' => 'API endpoint is accessible',
    'path' => __DIR__,
    'time' => date('Y-m-d H:i:s')
]);