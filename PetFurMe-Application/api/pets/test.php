<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

echo json_encode([
    'status' => 'success',
    'message' => 'API endpoint is accessible',
    'path' => __FILE__,
    'document_root' => $_SERVER['DOCUMENT_ROOT']
]);
?> 