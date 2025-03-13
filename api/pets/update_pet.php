<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get the form data
    $data = json_decode($_POST['data'], true);
    
    // Handle photo update - match the working approach from AddPetName.js
    $photo_binary = null;
    if (isset($_POST['photo'])) {
        // Convert base64 to binary data
        $photo_binary = base64_decode($_POST['photo']);
    }

    // Prepare the SQL query
    $sql = "UPDATE pets SET 
            name = ?,
            type = ?,
            breed = ?,
            gender = ?,
            age = ?,
            weight = ?,
            size = ?,
            allergies = ?,
            notes = ?,
            photo = ?,      -- Update both photo and photo_data
            photo_data = ?  -- This ensures trigger works properly
            WHERE id = ? AND user_id = ?";

    $stmt = $db->prepare($sql);
    
    // Create params array
    $params = [
        $data['name'],
        $data['type'],
        $data['breed'],
        $data['gender'],
        $data['age'],
        $data['weight'],
        $data['size'],
        $data['allergies'],
        $data['notes'],
        $photo_binary,  // photo column
        $photo_binary,  // photo_data column
        $data['pet_id'],
        $data['user_id']
    ];

    // Execute with params
    if (!$stmt->execute($params)) {
        throw new Exception($stmt->error);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Pet updated successfully'
    ]);

} catch (Exception $e) {
    error_log("Error in update_pet.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 