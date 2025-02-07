<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once '../../config/Database.php';
include_once '../../models/Message.php';

try {
    // Instantiate DB & connect
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Instantiate message object
    $message = new Message($db);

    // Get user_id from URL
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die(json_encode([
        'success' => false,
        'message' => 'Missing user_id parameter'
    ]));

    // Get messages
    $result = $message->getMessages($user_id);
    
    if($result) {
        $messages_arr = array();
        
        while($row = $result->fetch(PDO::FETCH_ASSOC)) {
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

        echo json_encode(array(
            'success' => true,
            'messages' => $messages_arr
        ));
    } else {
        echo json_encode(array(
            'success' => true, // Changed to true since empty messages is valid
            'messages' => []
        ));
    }
} catch(Exception $e) {
    echo json_encode(array(
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ));
}
?> 