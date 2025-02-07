<?php
class Message {
    private $conn;
    private $table = 'messages';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getMessages($user_id) {
        $query = "SELECT * FROM " . $this->table . " 
                 WHERE (sender_id = :user_id OR receiver_id = :user_id)
                 ORDER BY sent_at ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        
        try {
            $stmt->execute();
            return $stmt;
        } catch(PDOException $e) {
            return false;
        }
    }

    public function createMessage($sender_id, $receiver_id, $message, $conversation_id = null, $is_automated = 0) {
        $query = "INSERT INTO " . $this->table . "
                (sender_id, receiver_id, message, conversation_id, is_automated)
                VALUES (:sender_id, :receiver_id, :message, :conversation_id, :is_automated)";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(':sender_id', $sender_id);
        $stmt->bindParam(':receiver_id', $receiver_id);
        $stmt->bindParam(':message', $message);
        $stmt->bindParam(':conversation_id', $conversation_id);
        $stmt->bindParam(':is_automated', $is_automated);

        try {
            return $stmt->execute();
        } catch(PDOException $e) {
            return false;
        }
    }
}
?> 