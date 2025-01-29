<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

include_once '../config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Modified query to get all products regardless of quantity
    $query = "SELECT p.*, c.name as category_name 
              FROM products p 
              LEFT JOIN categories c ON p.category_id = c.id 
              ORDER BY p.created_at DESC";
              
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        error_log("Prepare failed: " . $db->error);
        throw new Exception("Prepare failed: " . $db->error);
    }

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $products = array();
        $count = 0;
        
        while ($row = $result->fetch_assoc()) {
            $count++;
            // Ensure all necessary fields exist
            $row['id'] = $row['id'] ?? null;
            $row['name'] = $row['name'] ?? '';
            $row['selling_price'] = $row['selling_price'] ?? 0;
            $row['quantity'] = $row['quantity'] ?? 0;
            $row['notes'] = $row['notes'] ?? '';
            
            // Clean up the product image path if it exists
            if (!empty($row['product_image'])) {
                if (!str_starts_with($row['product_image'], 'http')) {
                    $row['product_image'] = 'uploads/products/' . basename($row['product_image']);
                }
            }
            
            $products[] = $row;
        }
        
        error_log("Found $count products");
        error_log("Products data: " . json_encode($products));
        
        echo json_encode([
            'success' => true,
            'products' => $products,
            'count' => $count
        ]);
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $stmt->close();
    $db->close();
    
} catch(Exception $e) {
    error_log("Product fetch error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?> 