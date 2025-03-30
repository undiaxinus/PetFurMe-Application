<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

function checkPermissions($path) {
    return [
        'path' => $path,
        'exists' => file_exists($path),
        'readable' => is_readable($path),
        'writable' => is_writable($path),
        'permissions' => substr(sprintf('%o', fileperms($path)), -4),
        'owner' => posix_getpwuid(fileowner($path))['name'],
        'group' => posix_getgrgid(filegroup($path))['name']
    ];
}

$root = $_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application';

echo json_encode([
    'success' => true,
    'server' => [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'],
        'document_root' => $_SERVER['DOCUMENT_ROOT'],
        'current_user' => get_current_user(),
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size' => ini_get('post_max_size')
    ],
    'permissions' => [
        'api_dir' => checkPermissions($root . '/api'),
        'config_dir' => checkPermissions($root . '/api/config'),
        'uploads_dir' => checkPermissions($root . '/uploads'),
        'user_photos_dir' => checkPermissions($root . '/uploads/user_photos'),
        'pet_photos_dir' => checkPermissions($root . '/uploads/pet_photos'),
        'database_file' => checkPermissions($root . '/api/config/database.php')
    ]
]);
?> 