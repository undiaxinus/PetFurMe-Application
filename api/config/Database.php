<?php
class Database {
    private $host = "localhost";
    private $db_name = "u211529883_pet_management";
    private $username = "u211529883_petfurme";
    private $password = "223Petfurme";
    public $conn;

    public function connect() {
        return $this->getConnection();
    }

    public function getConnection() {
        $this->conn = null;

        try {
            error_log("Attempting database connection to {$this->host}/{$this->db_name}");
            
            // Use MySQLi connection
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
            
            if ($this->conn->connect_error) {
                error_log("Connection Error: " . $this->conn->connect_error);
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }

            // Set charset
            $this->conn->set_charset("utf8");
            
            error_log("Database connection successful");
            return $this->conn;
            
        } catch(Exception $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
}
?> 