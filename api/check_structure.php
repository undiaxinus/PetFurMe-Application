<?php
header('Content-Type: application/json');

$required_dirs = [
    '/PetFurMe-Application',
    '/PetFurMe-Application/api',
    '/PetFurMe-Application/api/config',
    '/PetFurMe-Application/api/users',
    '/PetFurMe-Application/uploads',
    '/PetFurMe-Application/uploads/user_photos',
    '/PetFurMe-Application/uploads/pet_photos'
];

$required_files = [
    '/PetFurMe-Application/api/config/database.php',
    '/PetFurMe-Application/api/config/constants.php',
    '/PetFurMe-Application/api/users/get_user_photo.php'
];

$results = [
    'document_root' => $_SERVER['DOCUMENT_ROOT'],
    'directories' => [],
    'files' => []
];

foreach ($required_dirs as $dir) {
    $full_path = $_SERVER['DOCUMENT_ROOT'] . $dir;
    $results['directories'][$dir] = [
        'exists' => is_dir($full_path),
        'writable' => is_writable($full_path),
        'permissions' => substr(sprintf('%o', fileperms($full_path)), -4)
    ];
}

foreach ($required_files as $file) {
    $full_path = $_SERVER['DOCUMENT_ROOT'] . $file;
    $results['files'][$file] = [
        'exists' => file_exists($full_path),
        'readable' => is_readable($full_path),
        'permissions' => substr(sprintf('%o', fileperms($full_path)), -4)
    ];
}

echo json_encode($results, JSON_PRETTY_PRINT);
?> 