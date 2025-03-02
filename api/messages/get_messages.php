<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Add error logging
error_log("Starting get_messages.php");

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../../models/Message.php';

try {
    // Instantiate DB & connect
    $database = new Database();
    error_log("Created Database instance");
    
    $db = $database->connect();
    error_log("Attempted to get database connection");

    if (!$db) {
        throw new Exception("Database connection failed - check database credentials");
    }

    // Get and validate user_id
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    error_log("Received user_id: " . ($user_id ?? 'null'));
    
    if (!$user_id) {
        throw new Exception("Missing user_id parameter");
    }

    // Log the user_id
    error_log("Fetching messages for user_id: " . $user_id);

    // Modified query to get messages where user is either sender or in receivers
    $query = "SELECT 
        m.*,
        u.name as sender_name,
        u.role as sender_role
    FROM messages m 
    JOIN users u ON m.sender_id = u.id
    WHERE m.sender_id = ? 
       OR JSON_CONTAINS(m.receivers, JSON_OBJECT('id', CAST(? AS CHAR)))
    ORDER BY m.sent_at ASC";

    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    $stmt->bind_param("ii", $user_id, $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $messages_arr = array();
    
    while ($row = $result->fetch_assoc()) {
        $receivers = json_decode($row['receivers'], true);
        
        $message_item = array(
            'id' => $row['id'],
            'sender_id' => $row['sender_id'],
            'sender_name' => $row['sender_name'],
            'sender_role' => $row['sender_role'],
            'receivers' => $receivers,
            'message' => $row['message'],
            'conversation_id' => $row['conversation_id'],
            'is_automated' => $row['is_automated'] ?? 0,
            'sent_at' => $row['sent_at']
        );
        array_push($messages_arr, $message_item);
    }

    error_log("Sending response with " . count($messages_arr) . " messages");
    echo json_encode(array(
        'success' => true,
        'messages' => $messages_arr,
        'count' => count($messages_arr)
    ));

} catch(Exception $e) {
    error_log("Error in get_messages.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'message' => $e->getMessage()
    ));
} finally {
    // Clean up
    if (isset($stmt)) $stmt->close();
    if (isset($db)) $db->close();
}
?> 