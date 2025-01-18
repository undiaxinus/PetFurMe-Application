<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

require_once '../../config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    $pet_id = isset($_GET['pet_id']) ? $_GET['pet_id'] : null;

    if (!$pet_id) {
        throw new Exception("Pet ID is required");
    }

    error_log("Attempting to fetch pet with ID: " . $pet_id);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
} 