<?php
class Message {
    private $conn;
    private $table = 'messages';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getMessages($user_id) {
        error_log("Getting messages for user_id: " . $user_id);
        
        $query = "SELECT * FROM " . $this->table . " 
                 WHERE (sender_id = ? OR receiver_id = ?)
                 ORDER BY sent_at ASC";

        error_log("Query: " . $query);

        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            error_log("Prepare failed: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("ii", $user_id, $user_id);
        
        if (!$stmt->execute()) {
            error_log("Execute failed: " . $stmt->error);
            return false;
        }

        return $stmt->get_result();
    }

    public function createMessage($sender_id, $receiver_id, $message, $conversation_id = null, $is_automated = 0) {
        $query = "INSERT INTO " . $this->table . "
                (sender_id, receiver_id, message, conversation_id, is_automated)
                VALUES (?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            error_log("Prepare failed: " . $this->conn->error);
            return false;
        }

        // Bind parameters using MySQLi syntax
        $stmt->bind_param("iissi", 
            $sender_id, 
            $receiver_id, 
            $message, 
            $conversation_id, 
            $is_automated
        );

        try {
            $success = $stmt->execute();
            if (!$success) {
                error_log("Execute failed: " . $stmt->error);
            }
            return $success;
        } catch(Exception $e) {
            error_log("Error creating message: " . $e->getMessage());
            return false;
        } finally {
            $stmt->close();
        }
    }
}
?> 