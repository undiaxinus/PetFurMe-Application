<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

include_once '../config/Database.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if(!$data->name || !$data->age || !$data->type || !$data->breed) {
    echo json_encode(array('message' => 'Missing Required Fields'));
    exit();
}

try {
    $database = new Database();
    $db = $database->connect();

    // Prepare query
    $query = "INSERT INTO pets (name, age, type, breed, category) VALUES (:name, :age, :type, :breed, :category)";
    
    $stmt = $db->prepare($query);
    
    // Clean and bind data
    $stmt->bindParam(':name', htmlspecialchars(strip_tags($data->name)));
    $stmt->bindParam(':age', $data->age);
    $stmt->bindParam(':type', htmlspecialchars(strip_tags($data->type)));
    $stmt->bindParam(':breed', htmlspecialchars(strip_tags($data->breed)));
    $stmt->bindParam(':category', htmlspecialchars(strip_tags($data->category)));

    if($stmt->execute()) {
        echo json_encode(array('message' => 'Pet Created Successfully'));
    } else {
        echo json_encode(array('message' => 'Pet Creation Failed'));
    }
    
} catch(PDOException $e) {
    echo json_encode(array('message' => 'Database Error: ' . $e->getMessage()));
}
?> 