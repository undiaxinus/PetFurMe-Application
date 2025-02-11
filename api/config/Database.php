<?php
class Database {
    private $host = "localhost";
    private $db_name = "pet-management";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        error_log("Attempting database connection...");
        error_log("Host: " . $this->host);
        error_log("Database: " . $this->db_name);
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                )
            );
            error_log("Database connection successful");
            return $this->conn;
        } catch(PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
}
?> 