<?php
require_once '../config/database.php';

try {
    // Get the user ID from the request
    $user_id = $_GET['user_id'];
    error_log("Received request for user_id: " . $user_id);

    // Validate the user ID
    if (!is_numeric($user_id)) {
        throw new Exception("Invalid user ID");
    }

    // Connect to the database
    $db = new Database();
    $conn = $db->connect();
    error_log("Database connection established");

    // Prepare the SQL statement
    $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    error_log("SQL query executed, num_rows: " . $result->num_rows);

    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();
        error_log("User data retrieved: " . json_encode($row));

        // Build the user data array, handling null values
        $user_data = [
            'id' => $row['id'],
            'uuid' => $row['uuid'],
            'username' => $row['username'] ?? '',
            'name' => $row['name'] ?? '',
            'email' => $row['email'] ?? '',
            'phone' => $row['phone'] ?? '',
            'age' => $row['age'] ?? null,
            'address' => $row['address'] ?? '',
            'photo' => $row['photo'] ?? '',
            'role' => $row['role'] ?? '',
            'email_verified_at' => $row['email_verified_at'] ?? null,
            'store_name' => $row['store_name'] ?? '',
            'store_address' => $row['store_address'] ?? '',
            'store_email' => $row['store_email'] ?? '',
            'complete_credentials' => $row['complete_credentials'] ?? 0,
            'verified_by' => $row['verified_by'] ?? null,
        ];

        $response = [
            'success' => true,
            'profile' => $user_data
        ];

        error_log("Sending success response: " . json_encode($response));
        echo json_encode($response);
    } else {
        error_log("No user found for ID: " . $user_id);
        throw new Exception("User not found");
    }

} catch (Exception $e) {
    error_log("Error in get_user_data2.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
} 