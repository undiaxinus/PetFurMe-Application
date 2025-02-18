<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once '../config/Database.php';

try {
    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }

    $user_id = $_GET['user_id'];
    
    $database = new Database();
    $db = $database->connect();

    $query = "
        SELECT 
            pr.record_id,
            pr.pet_id,
            pr.record_date,
            pr.record_type,
            pr.description,
            p.pet_name
        FROM pet_records pr
        JOIN pets p ON pr.pet_id = p.pet_id
        WHERE p.user_id = ?
        ORDER BY pr.record_date DESC
        LIMIT 10
    ";

    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);

    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process attachments if any
    foreach ($records as &$record) {
        if ($record['attachments']) {
            $record['attachments'] = json_decode($record['attachments'], true);
        }
    }

    echo json_encode([
        'success' => true,
        'records' => $records
    ]);

} catch (Exception $e) {
    error_log("Error in get_pet_records.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch pet records: ' . $e->getMessage()
    ]);
}
?> 