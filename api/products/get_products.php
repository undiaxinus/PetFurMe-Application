<?php
// Clear any previous output
ob_clean();

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

require_once __DIR__ . '/../config/database.php';

// Start output buffering
ob_start();

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Debug database connection
    error_log("Database connected successfully");

    $query = "SELECT p.*, c.name as category_name 
              FROM products p 
              LEFT JOIN categories c ON p.category_id = c.id 
              ORDER BY p.created_at DESC";
              
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $products = array();
        $count = 0;
        
        while ($row = $result->fetch_assoc()) {
            $count++;
            error_log("Processing product: " . $row['id']);
            
            // Clean data and handle image data
            $productData = array(
                'id' => $row['id'] ?? null,
                'name' => $row['name'] ?? '',
                'selling_price' => (int)($row['selling_price'] ?? 0),
                'quantity' => (int)($row['quantity'] ?? 0),
                'notes' => $row['notes'] ?? '',
                'category_name' => $row['category_name'] ?? null,
                'category_id' => $row['category_id'] ?? null
            );

            // Handle the BLOB data
            if (!empty($row['product_image_data'])) {
                $productData['product_image_data'] = base64_encode($row['product_image_data']);
                error_log("Image data encoded for product: " . $row['id']);
            } else if (!empty($row['product_image'])) {
                // Fallback to file path if exists
                $productData['product_image'] = 'uploads/products/' . basename($row['product_image']);
                error_log("Using file path for product: " . $row['id']);
            }

            $products[] = $productData;
        }
        
        error_log("Found $count products");
        
        // Clear any previous output and send JSON response
        ob_clean();
        echo json_encode([
            'success' => true,
            'products' => $products,
            'count' => $count
        ]);
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
} catch(Exception $e) {
    error_log("Product fetch error: " . $e->getMessage());
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($db)) $db->close();
}
?> 