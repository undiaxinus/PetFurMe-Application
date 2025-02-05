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