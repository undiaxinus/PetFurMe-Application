<?php
// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Include the direct mailer helper
require_once '../helpers/mailer_direct.php';

// Test email address - replace with your test email
$test_email = isset($_GET['email']) ? $_GET['email'] : 'your-test-email@example.com';

// Get current server details
$server_info = [
    'php_version' => PHP_VERSION,
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'script_path' => __FILE__,
    'directory' => __DIR__,
    'time' => date('Y-m-d H:i:s')
];

// Create a test email message
$subject = 'PHPMailer Test Email';
$message = "
    <html>
    <head>
        <title>PHPMailer Test</title>
    </head>
    <body>
        <h1>PHPMailer Test Email</h1>
        <p>This is a test email to verify that PHPMailer is working properly.</p>
        <p>Sent at: " . date('Y-m-d H:i:s') . "</p>
        <p>Server Information:</p>
        <pre>" . json_encode($server_info, JSON_PRETTY_PRINT) . "</pre>
    </body>
    </html>
";

try {
    // Attempt to send the test email
    $emailSent = sendEmail($test_email, $subject, $message);
    
    if ($emailSent) {
        echo json_encode([
            'success' => true,
            'message' => "Test email sent successfully to $test_email",
            'server_info' => $server_info
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => "Failed to send test email",
            'server_info' => $server_info
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'server_info' => $server_info
    ]);
}
?> 