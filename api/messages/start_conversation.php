<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id'])) {
        throw new Exception('User ID is required');
    }

    $database = new Database();
    $conn = $database->connect();

    // Get the most recently active admin/sub-admin
    $adminQuery = "SELECT id FROM users 
                  WHERE role IN ('admin', 'sub_admin') 
                    AND deleted_at IS NULL 
                  ORDER BY last_activity DESC 
                  LIMIT 1";
                  
    $adminStmt = $conn->prepare($adminQuery);
    $adminStmt->execute();
    $adminResult = $adminStmt->get_result();
    $admin = $adminResult->fetch_assoc();

    if (!$admin) {
        throw new Exception('No admin available');
    }

    // Check if conversation already exists
    $checkQuery = "SELECT id FROM conversations 
                  WHERE pet_owner_id = ? AND admin_id = ? 
                  ORDER BY updated_at DESC LIMIT 1";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("ii", $data['user_id'], $admin['id']);
    $checkStmt->execute();
    $existingConv = $checkStmt->get_result()->fetch_assoc();

    if ($existingConv) {
        // Return existing conversation
        echo json_encode([
            'success' => true,
            'conversation_id' => $existingConv['id'],
            'admin_id' => $admin['id']
        ]);
        exit;
    }

    // Create a new conversation
    $uniqueKey = 'conv_' . uniqid();
    $query = "INSERT INTO conversations (unique_key, pet_owner_id, admin_id, created_at, updated_at) 
              VALUES (?, ?, ?, NOW(), NOW())";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sii", $uniqueKey, $data['user_id'], $admin['id']);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to create conversation');
    }

    $conversation_id = $conn->insert_id;

    echo json_encode([
        'success' => true,
        'conversation_id' => $conversation_id,
        'admin_id' => $admin['id']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($checkStmt)) $checkStmt->close();
    if (isset($adminStmt)) $adminStmt->close();
    if (isset($conn)) $conn->close();
} 