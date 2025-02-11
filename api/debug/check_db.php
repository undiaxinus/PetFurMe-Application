<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');

require_once '../config/Database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Test queries
    $queries = [
        'pets' => "SELECT COUNT(*) as count FROM pets",
        'users' => "SELECT COUNT(*) as count FROM users",
        'products' => "SELECT COUNT(*) as count FROM products"
    ];
    
    $results = [];
    foreach ($queries as $table => $query) {
        $stmt = $conn->query($query);
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        $results[$table] = $count;
        error_log("Table {$table} has {$count} records");
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'tables' => $results,
        'server_info' => [
            'php_version' => PHP_VERSION,
            'mysql_version' => $conn->getAttribute(PDO::ATTR_SERVER_VERSION),
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Database check failed: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database check failed: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?> 