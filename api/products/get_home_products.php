<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log the start of the request
error_log("Starting get_home_products.php request");

require_once '../config/database.php';

try {
    $database = new Database();
    $conn = $database->connect();

    // Log the connection status
    error_log("Database connection status: " . ($conn ? "success" : "failed"));

    // Modified query to include product_image_data and limit to 2
    $query = "SELECT p.*, c.name as category_name 
              FROM products p 
              LEFT JOIN categories c ON p.category_id = c.id 
              WHERE p.product_image_data IS NOT NULL 
              ORDER BY p.created_at DESC 
              LIMIT 2";

    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $products = array();

    while ($row = $result->fetch_assoc()) {
        // Convert BLOB to base64
        $imageData = null;
        if (!empty($row['product_image_data'])) {
            $imageData = base64_encode($row['product_image_data']);
        }
        
        $products[] = array(
            'id' => $row['id'],
            'name' => $row['name'],
            'code' => $row['code'],
            'quantity' => $row['quantity'],
            'selling_price' => $row['selling_price'],
            'quantity_alert' => $row['quantity_alert'],
            'notes' => $row['notes'],
            'product_image_data' => $imageData,
            'category_id' => $row['category_id'],
            'category_name' => $row['category_name']
        );
    }

    // If we have less than 2 products, add dummy products
    while (count($products) < 2) {
        $products[] = array(
            'id' => 'dummy' . count($products),
            'name' => 'Sample Product ' . (count($products) + 1),
            'code' => 'SAMPLE' . (count($products) + 1),
            'quantity' => 10,
            'selling_price' => 10000,
            'quantity_alert' => 5,
            'notes' => 'Sample product',
            'product_image_data' => null,
            'category_id' => '1',
            'category_name' => 'Pet Product'
        );
    }

    echo json_encode([
        'success' => true,
        'products' => $products,
        'count' => count($products)
    ]);

} catch (Exception $e) {
    error_log("Error in get_home_products.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch products: ' . $e->getMessage()
    ]);
}

// Log the end of the request
error_log("Completed get_home_products.php request");
?> 