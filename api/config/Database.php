<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'pet-management';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function connect() {
        $this->conn = mysqli_connect($this->host, $this->username, $this->password, $this->db_name);
        
        if (!$this->conn) {
            die("Connection failed: " . mysqli_connect_error());
        }
        
        return $this->conn;
    }
}
?> 