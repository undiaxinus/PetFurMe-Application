<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Add more detailed error logging
error_log("Starting get_messages.php - " . date('Y-m-d H:i:s'));
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("Query string: " . $_SERVER['QUERY_STRING']);

// Add detailed request logging
error_log("Request Headers: " . print_r(getallheaders(), true));
error_log("GET Parameters: " . print_r($_GET, true));

require_once __DIR__ . '/../config/database.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Simplified validation
    if (!isset($_GET['user_id'])) {
        throw new Exception("Missing user_id parameter");
    }
    
    $user_id = (int)$_GET['user_id'];
    error_log("Processing user_id: " . $user_id);

    // Use a very basic query first to test database connectivity
    $test_query = "SELECT COUNT(*) as count FROM messages";
    $test_result = $db->query($test_query);
    if (!$test_result) {
        error_log("Basic test query failed: " . $db->error);
        throw new Exception("Database test failed: " . $db->error);
    }
    $test_row = $test_result->fetch_assoc();
    error_log("Found " . $test_row['count'] . " total messages in database");

    // Update the query to get BOTH sent AND received messages
    $query = "SELECT m.*, u.name as sender_name, u.role as sender_role 
              FROM messages m 
              LEFT JOIN users u ON m.sender_id = u.id 
              WHERE m.sender_id = ? 
                 OR JSON_CONTAINS(m.receivers, JSON_OBJECT('id', CAST(? AS CHAR)))
              ORDER BY m.sent_at ASC";  // Changed to ASC for chronological order
              
    $stmt = $db->prepare($query);
    if (!$stmt) {
        error_log("Prepare failed: " . $db->error);
        throw new Exception("Query preparation failed: " . $db->error);
    }
    
    // Bind user_id twice - once for sender_id and once for receivers JSON
    $stmt->bind_param("is", $user_id, $user_id);
    
    if (!$stmt->execute()) {
        error_log("Execute failed: " . $stmt->error);
        throw new Exception("Query execution failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    error_log("Query returned " . $result->num_rows . " rows");
    
    $messages_arr = array();
    
    while ($row = $result->fetch_assoc()) {
        $receivers = [];
        if (!empty($row['receivers'])) {
            $receivers = json_decode($row['receivers'], true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log("JSON decode error for receivers: " . json_last_error_msg());
                $receivers = [];  // Default to empty array if JSON is invalid
            }
        }
        
        $message_item = array(
            'id' => $row['id'],
            'sender_id' => $row['sender_id'],
            'sender_name' => $row['sender_name'] ?: 'Unknown',
            'sender_role' => $row['sender_role'] ?: 'user',
            'receivers' => $receivers,
            'message' => $row['message'],
            'conversation_id' => $row['conversation_id'],
            'is_automated' => $row['is_automated'] ?? 0,
            'sent_at' => $row['sent_at']
        );
        $messages_arr[] = $message_item;
    }
    
    echo json_encode(array(
        'success' => true,
        'messages' => $messages_arr,
        'count' => count($messages_arr),
        'user_id' => $user_id
    ));

} catch(Exception $e) {
    error_log("Error in get_messages.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'message' => $e->getMessage(),
        'debug_info' => [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ));
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($db)) $db->close();
}
?> 