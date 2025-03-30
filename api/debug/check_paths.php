<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Helper function to check file existence
function checkFile($path) {
    $exists = file_exists($path);
    $readable = $exists ? is_readable($path) : false;
    $size = $exists ? filesize($path) : null;
    
    return [
        'exists' => $exists,
        'readable' => $readable,
        'size' => $size,
        'path' => $path
    ];
}

// Return server information and file paths for debugging
echo json_encode([
    'success' => true,
    'server' => [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'],
        'document_root' => $_SERVER['DOCUMENT_ROOT'],
        'script_filename' => $_SERVER['SCRIPT_FILENAME'],
        'request_uri' => $_SERVER['REQUEST_URI'],
        'server_name' => $_SERVER['SERVER_NAME'],
        'http_host' => $_SERVER['HTTP_HOST'] ?? 'not set'
    ],
    'directories' => [
        'app_root' => checkFile($_SERVER['DOCUMENT_ROOT']),
        'api_exists' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api'),
        'pets_exists' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/pets'),
        'users_exists' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/users'),
        'products_exists' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/products'),
        'appointments_exists' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/appointments')
    ],
    'files' => [
        'login.php' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/auth/login.php'),
        'get_user_pets.php' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/pets/get_user_pets.php'),
        'get_user_photo.php' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/users/get_user_photo.php'),
        'get_home_products.php' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/products/get_home_products.php'),
        'get_upcoming.php' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/appointments/get_upcoming.php'),
        'check_profile_status.php' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/users/check_profile_status.php'),
        'get_pet_records.php' => checkFile($_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/pets/get_pet_records.php')
    ]
]);
?> 