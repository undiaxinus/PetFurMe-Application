<?php
class Database {
    private $host = "localhost";
    private $database_name = "your_database_name";
    private $username = "your_username";
    private $password = "your_password";
    public $conn;

    public function connect() {
        $this->conn = null;
        try {
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->database_name);
            if ($this->conn->connect_error) {
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }
            return $this->conn;
        } catch(Exception $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw $e;
        }
    }
}
?> 