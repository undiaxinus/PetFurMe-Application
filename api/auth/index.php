<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

echo json_encode([
    'status' => 'active',
    'directory' => 'auth',
    'available_endpoints' => [
        'login' => 'POST /auth/login.php',
        'test' => 'GET /auth/test.php'
    ]
]); 