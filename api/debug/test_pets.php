<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    // Test query to count all pets
    $count_query = "SELECT COUNT(*) as total FROM pets WHERE deleted_at IS NULL";
    $result = $db->query($count_query);
    $total = $result->fetch_assoc()['total'];
    
    // Get sample of pets
    $sample_query = "SELECT id, user_id, name, type FROM pets WHERE deleted_at IS NULL LIMIT 5";
    $sample_result = $db->query($sample_query);
    $samples = [];
    while($row = $sample_result->fetch_assoc()) {
        $samples[] = $row;
    }
    
    // Get table structure
    $structure_query = "DESCRIBE pets";
    $structure_result = $db->query($structure_query);
    $structure = [];
    while($row = $structure_result->fetch_assoc()) {
        $structure[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'total_pets' => $total,
        'sample_pets' => $samples,
        'table_structure' => $structure,
        'server_time' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
    
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>