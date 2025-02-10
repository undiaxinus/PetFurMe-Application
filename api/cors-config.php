<?php
// Set strict CORS headers for all API endpoints
function setCorsHeaders() {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        $allowed_origins = array(
            'http://localhost:8081',
            'http://localhost:3000',
            'http://localhost'
        );
        
        if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
            header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        }
    }
    
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
    header("Access-Control-Max-Age: 86400");
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        header("HTTP/1.1 200 OK");
        exit();
    }
}

// Call this function at the beginning of each API endpoint
setCorsHeaders();
?> 