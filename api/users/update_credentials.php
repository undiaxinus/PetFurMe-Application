<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id)) {
        throw new Exception("User ID is required");
    }

    $updates = array();
    $types = "";
    $params = array();

    // Add email update if provided
    if (isset($data->email)) {
        $updates[] = "email = ?";
        $types .= "s";
        $params[] = $data->email;
        // Set email_verified_at to NULL when email is updated
        $updates[] = "email_verified_at = NULL";
    }

    // Add password update if provided
    if (isset($data->password)) {
        $updates[] = "password = ?";
        $types .= "s";
        $params[] = password_hash($data->password, PASSWORD_DEFAULT);
    }

    if (empty($updates)) {
        throw new Exception("No updates provided");
    }

    // Add user_id to params
    $types .= "i";
    $params[] = $data->user_id;

    $query = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
    $stmt = $db->prepare($query);

    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    // Create array with references
    $bind_params = array($types);
    foreach ($params as $key => $value) {
        $bind_params[] = &$params[$key];
    }

    call_user_func_array(array($stmt, 'bind_param'), $bind_params);

    if ($stmt->execute()) {
        $response = [
            'success' => true,
            'message' => 'Credentials updated successfully'
        ];
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    echo json_encode($response);

} catch (Exception $e) {
    error_log("Error in update_credentials.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($db)) {
        $db->close();
    }
}
?> 