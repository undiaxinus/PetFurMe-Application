<?php
/**
 * Central CORS configuration for the API
 */
function setCorsHeaders() {
    // Allow from localhost development server
    header("Access-Control-Allow-Origin: http://localhost:8081");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Set headers immediately
setCorsHeaders();
?> 