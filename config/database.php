<?php
class Database {
    // Database credentials
    private $host = "localhost";
    private $db_name = "u336332733_pet_management";
    private $username = "u336332733_PFM";
    private $password = "PetFurMe1423";
    private $conn;

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            return false;
        }

        return $this->conn;
    }
}
?> 