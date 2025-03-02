<?php
// ... database connection and other initialization code ...

$user_id = $_GET['user_id'] ?? null;

if ($user_id) {
    $query = "SELECT * FROM pets WHERE user_id = ? AND deleted_at IS NULL";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $pets = [];
    while ($row = $result->fetch_assoc()) {
        // Handle photo data
        if ($row['photo']) {
            // If photo contains binary data (BLOB)
            if (substr($row['photo'], 0, 4) === '\x00') {
                // Generate a filename and save to disk
                $filename = 'pet_' . $row['id'] . '_' . uniqid() . '.jpg';
                $filepath = 'uploads/pet_photos/' . $filename;
                
                if (file_put_contents($filepath, $row['photo'])) {
                    // Update database with file path
                    $update = "UPDATE pets SET photo = ? WHERE id = ?";
                    $update_stmt = $conn->prepare($update);
                    $update_stmt->bind_param("si", $filepath, $row['id']);
                    $update_stmt->execute();
                    
                    $row['photo'] = $filepath;
                }
            }
            
            // Construct full URL for photo
            if (!filter_var($row['photo'], FILTER_VALIDATE_URL)) {
                $row['photo'] = 'http://' . $_SERVER['HTTP_HOST'] . '/PetFurMe-Application/' . $row['photo'];
            }
        }
        
        $pets[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'pets' => $pets
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'User ID is required'
    ]);
}
?> 