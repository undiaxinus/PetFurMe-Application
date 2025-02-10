<?php
header('Content-Type: application/json');

$email = 'yureasel1@gmail.com';
$password = '123456789';
$storedHash = '$2y$10$AeQSDMLTQRVQ9pWQhX2tUOWxhdVsM2RDpvb0BxnPRGaj2ZWv1Z8pO';

// Test the hash
$result = [
    'email' => $email,
    'password_length' => strlen($password),
    'hash_info' => password_get_info($storedHash),
    'verification_result' => password_verify($password, $storedHash),
    // Create a new hash for comparison
    'new_hash' => password_hash($password, PASSWORD_DEFAULT),
];

echo json_encode($result, JSON_PRETTY_PRINT);
?> 