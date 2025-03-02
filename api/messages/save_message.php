<?php
require_once __DIR__ . '/../config/Database.php';
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

    // Only require sender_id and message
    if (!isset($data['sender_id']) || !isset($data['message'])) {
        throw new Exception('Missing required fields: sender_id and message are required');
    }

    // Validate data types
    if (!is_numeric($data['sender_id'])) {
        logDebug("Invalid ID format - sender_id: {$data['sender_id']}");
        throw new Exception('Invalid ID format');
    }

    logDebug("Connecting to database...");
    $database = new Database();
    $conn = $database->connect();
    logDebug("Database connection established");

    // Get sender's role
    $senderQuery = "SELECT role FROM users WHERE id = ?";
    $senderStmt = $conn->prepare($senderQuery);
    $senderStmt->bind_param("i", $data['sender_id']);
    $senderStmt->execute();
    $senderResult = $senderStmt->get_result();
    
    if (!$senderResult) {
        throw new Exception('Failed to get sender information');
    }
    
    $senderData = $senderResult->fetch_assoc();
    $senderRole = $senderData['role'];

    if ($senderRole === 'pet_owner') {
        // Get all active admins and sub-admins
        $receivers = "SELECT id, role FROM users 
                     WHERE role IN ('admin', 'sub_admin') 
                     AND deleted_at IS NULL 
                     ORDER BY last_activity DESC";
        $receiverStmt = $conn->prepare($receivers);
        $receiverStmt->execute();
        $result = $receiverStmt->get_result();
        
        // Create receivers array
        $receiversArray = [];
        while ($receiver = $result->fetch_assoc()) {
            $receiversArray[] = [
                'id' => $receiver['id'],
                'role' => $receiver['role']
            ];
        }

        // Store message with JSON receivers
        $query = "INSERT INTO messages (
            conversation_id,
            sender_id,
            receivers,
            message,
            sent_at,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())";

        $stmt = $conn->prepare($query);
        $receiversJson = json_encode($receiversArray);
        
        $stmt->bind_param("iiss", 
            $data['conversation_id'],
            $data['sender_id'],
            $receiversJson,
            $data['message']
        );

        if (!$stmt->execute()) {
            throw new Exception("Failed to save message");
        }

        echo json_encode([
            'success' => true,
            'message_id' => $conn->insert_id,
            'message' => 'Message sent to all administrators'
        ]);

    } else {
        // Admin/sub-admin sending to specific pet owner
        if (!isset($data['receiver_id'])) {
            throw new Exception('receiver_id is required for admin messages');
        }

        $receiversArray = [
            ['id' => $data['receiver_id'], 'role' => 'pet_owner']
        ];

        $query = "INSERT INTO messages (
            conversation_id,
            sender_id,
            receivers,
            message,
            sent_at,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())";

        $stmt = $conn->prepare($query);
        $receiversJson = json_encode($receiversArray);
        
        $stmt->bind_param("iiss", 
            $data['conversation_id'],
            $data['sender_id'],
            $receiversJson,
            $data['message']
        );

        if (!$stmt->execute()) {
            throw new Exception("Failed to save message");
        }

        echo json_encode([
            'success' => true,
            'message_id' => $conn->insert_id,
            'message' => 'Message sent successfully'
        ]);
    }

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
    if (isset($senderStmt)) {
        $senderStmt->close();
        logDebug("Sender statement closed");
    }
    if (isset($receiverStmt)) {
        $receiverStmt->close();
        logDebug("Receiver statement closed");
    }
    if (isset($conn)) {
        $conn->close();
        logDebug("Database connection closed");
    }
    logDebug("=== Request Complete ===\n");
} 