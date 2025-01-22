<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include_once '../../config/database.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

try {
    // Get the raw POST data
    $data = json_decode($_POST['data'], true);
    
    if (!$data) {
        throw new Exception('Invalid data received');
    }

    // Extract pet data
    $pet_id = $data['pet_id'];
    $user_id = $data['user_id'];
    $name = $data['name'];
    $age = $data['age'];
    $type = $data['type'];
    $breed = $data['breed'];
    $size = $data['size'];
    $weight = $data['weight'];
    $allergies = $data['allergies'];
    $notes = $data['notes'];
    $gender = $data['gender'];

    // Handle photo upload if provided
    $photo_url = null;
    if (isset($_FILES['photo'])) {
        $upload_dir = 'uploads/pet_photos/';
        
        // Create directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $file_extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '.' . $file_extension;
        $target_path = $upload_dir . $filename;

        if (move_uploaded_file($_FILES['photo']['tmp_name'], $target_path)) {
            $photo_url = "http://" . $_SERVER['HTTP_HOST'] . "/PetFurMe-Application/api/pets/" . $target_path;
        }
    }

    // Prepare SQL query
    $query = "UPDATE pets SET 
        name = ?, 
        age = ?, 
        type = ?, 
        breed = ?, 
        size = ?, 
        weight = ?, 
        allergies = ?, 
        notes = ?, 
        gender = ?";

    // Add photo to query if uploaded
    if ($photo_url) {
        $query .= ", photo = ?";
    }

    $query .= " WHERE id = ? AND user_id = ?";

    // Prepare and execute statement
    $stmt = $db->prepare($query);

    if ($photo_url) {
        $stmt->execute([
            $name,
            $age,
            $type,
            $breed,
            $size,
            $weight,
            $allergies,
            $notes,
            $gender,
            $photo_url,
            $pet_id,
            $user_id
        ]);
    } else {
        $stmt->execute([
            $name,
            $age,
            $type,
            $breed,
            $size,
            $weight,
            $allergies,
            $notes,
            $gender,
            $pet_id,
            $user_id
        ]);
    }

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Pet profile updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No changes made to pet profile'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update pet profile: ' . $e->getMessage()
    ]);
}
?> 