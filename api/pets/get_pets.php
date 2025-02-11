<?php
require_once '../cors-config.php';
setCorsHeaders();

// Enable detailed error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/pets_debug.log');

function logDebug($message, $data = null) {
    $log = "[" . date('Y-m-d H:i:s') . "] " . $message;
    if ($data) {
        $log .= " - Data: " . json_encode($data);
    }
    error_log($log);
}

try {
    logDebug("get_pets.php script started");
    logDebug("Request method: " . $_SERVER['REQUEST_METHOD']);
    logDebug("GET parameters:", $_GET);

    require_once '../config/Database.php';
    
    $database = new Database();
    $conn = $database->getConnection();
    logDebug("Database connection established");

    $user_id = $_GET['user_id'] ?? null;
    logDebug("Requested pets for user_id:", $user_id);

    if (!$user_id) {
        throw new Exception("User ID is required");
    }

    $query = "SELECT * FROM pets WHERE user_id = ? AND deleted_at IS NULL";
    logDebug("Executing query:", $query);
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    $stmt->execute([$user_id]);
    logDebug("Query executed successfully");
    
    $pets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    logDebug("Found pets count: " . count($pets));
    
    foreach ($pets as $pet) {
        logDebug("Pet record:", array_merge(
            ['id' => $pet['id']],
            ['name' => $pet['name']],
            ['type' => $pet['type']]
        ));
    }
    
    echo json_encode([
        'success' => true,
        'pets' => $pets,
        'count' => count($pets),
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    logDebug("Error occurred:", $e->getMessage());
    logDebug("Stack trace:", $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?> 