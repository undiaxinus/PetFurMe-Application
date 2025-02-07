<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

// Set up error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('error_log', __DIR__ . '/message_errors.log');

function logDebug($message) {
    error_log("[" . date('Y-m-d H:i:s') . "] " . $message . "\n", 3, __DIR__ . '/debug.log');
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

logDebug("=== New Message Save Request ===");
logDebug("Request Method: " . $_SERVER['REQUEST_METHOD']);
logDebug("Request Headers: " . json_encode(getallheaders()));

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method: ' . $_SERVER['REQUEST_METHOD']);
    }

    // Get and log raw request data
    $rawData = file_get_contents('php://input');
    logDebug("Raw request data: " . $rawData);
    
    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON decode error: ' . json_last_error_msg());
    }
    
    logDebug("Decoded data: " . json_encode($data));

    // Validate required fields
    if (!isset($data['sender_id'])) logDebug("Missing sender_id");
    if (!isset($data['receiver_id'])) logDebug("Missing receiver_id");
    if (!isset($data['message'])) logDebug("Missing message");
    
    if (!isset($data['sender_id']) || !isset($data['receiver_id']) || !isset($data['message'])) {
        throw new Exception('Missing required fields');
    }

    // Validate data types
    if (!is_numeric($data['sender_id']) || !is_numeric($data['receiver_id'])) {
        logDebug("Invalid ID format - sender_id: {$data['sender_id']}, receiver_id: {$data['receiver_id']}");
        throw new Exception('Invalid ID format');
    }

    logDebug("Connecting to database...");
    $database = new Database();
    $conn = $database->connect();
    logDebug("Database connection established");

    $query = "INSERT INTO messages (
                conversation_id,
                sender_id,
                receiver_id,
                message,
                sent_at,
                created_at,
                updated_at
              ) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())";
    
    logDebug("Preparing query: " . $query);
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        logDebug("Prepare failed: " . $conn->error);
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $sender_id = (int)$data['sender_id'];
    $receiver_id = (int)$data['receiver_id'];
    $message = $data['message'];
    $conversation_id = $data['conversation_id'] ?? null;

    logDebug("Binding parameters:");
    logDebug("sender_id: $sender_id");
    logDebug("receiver_id: $receiver_id");
    logDebug("message: $message");
    logDebug("conversation_id: " . var_export($conversation_id, true));

    $stmt->bind_param("iiis", 
        $conversation_id,
        $sender_id,
        $receiver_id,
        $message
    );
    
    logDebug("Executing query...");
    if (!$stmt->execute()) {
        logDebug("Execute failed: " . $stmt->error);
        throw new Exception('Failed to save message: ' . $stmt->error);
    }

    $message_id = $conn->insert_id;
    logDebug("Message saved successfully with ID: $message_id");

    $response = [
        'success' => true,
        'message_id' => $message_id,
        'message' => 'Message saved successfully'
    ];
    logDebug("Sending response: " . json_encode($response));
    echo json_encode($response);

} catch (Exception $e) {
    logDebug("Error occurred: " . $e->getMessage());
    http_response_code(500);
    $error_response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    logDebug("Sending error response: " . json_encode($error_response));
    echo json_encode($error_response);
} finally {
    if (isset($stmt)) {
        $stmt->close();
        logDebug("Statement closed");
    }
    if (isset($conn)) {
        $conn->close();
        logDebug("Database connection closed");
    }
    logDebug("=== Request Complete ===\n");
} 