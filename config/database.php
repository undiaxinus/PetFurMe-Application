<?php
class Database {
    // Database credentials
    private $host = "localhost";
    private $db_name = "pet-management";
    private $username = "root";
    private $password = "";
    public $conn;

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
            );
            return $this->conn;
        } catch(PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
}

$db_config = array(
    'hostname' => 'localhost',
    'database' => 'pet-management',
    'username' => 'root',
    'password' => ''
);
?> 