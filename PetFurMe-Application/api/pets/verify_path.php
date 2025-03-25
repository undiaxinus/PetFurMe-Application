<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$basePath = dirname(dirname(__DIR__)); // PetFurMe-Application directory
$apiPath = dirname(__DIR__); // api directory
$petsPath = __DIR__; // pets directory

$paths = [
    'update_pet.php' => file_exists($petsPath . '/update_pet.php'),
    'database.php' => file_exists($apiPath . '/config/database.php'),
    'test.php' => file_exists($apiPath . '/test.php')
];

echo json_encode([
    'status' => 'success',
    'paths' => [
        'base_path' => $basePath,
        'api_path' => $apiPath,
        'pets_path' => $petsPath,
        'file_exists' => $paths
    ]
]); 