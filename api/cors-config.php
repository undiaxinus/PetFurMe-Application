<?php
/**
 * Central CORS configuration for the API
 */
function setCorsHeaders() {
    // Always set these headers regardless of origin
    header("Access-Control-Allow-Origin: http://localhost:8081");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
    header("Access-Control-Max-Age: 86400"); // 24 hours cache
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Call this function at the beginning of each API endpoint
setCorsHeaders();
?> 