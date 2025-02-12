<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Add error logging
error_log("Starting get_messages.php");

include_once '../../config/Database.php';
include_once '../../models/Message.php';

try {
    // Instantiate DB & connect
    $database = new Database();
    error_log("Created Database instance");
    
    $db = $database->getConnection();
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

    // Instantiate message object
    $message = new Message($db);

    // Get messages
    $result = $message->getMessages($user_id);
    
    if ($result) {
        $messages_arr = array();
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            error_log("Processing message: " . json_encode($row));
            
            $message_item = array(
                'id' => $row['id'],
                'sender_id' => $row['sender_id'],
                'receiver_id' => $row['receiver_id'],
                'message' => $row['message'],
                'conversation_id' => $row['conversation_id'],
                'is_automated' => $row['is_automated'],
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
    } else {
        throw new Exception("Error fetching messages from database");
    }
} catch(Exception $e) {
    error_log("Error in get_messages.php: " . $e->getMessage());
    echo json_encode(array(
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'debug_info' => array(
            'user_id' => $user_id ?? 'not set',
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        )
    ));
}
?> 