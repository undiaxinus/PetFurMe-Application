<?php
// Simple mailer using PHP's built-in mail function
function sendMail($to, $subject, $message) {
    try {
        // Set headers
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: VetCare Support <petmanagementt@gmail.com>" . "\r\n";
        
        // Log the mail attempt
        error_log("Attempting to send email to: $to");
        
        // Send email
        $result = mail($to, $subject, $message, $headers);
        
        if ($result) {
            error_log("Email sent successfully to: $to");
            return ['success' => true];
        } else {
            error_log("Failed to send email using mail() function");
            return [
                'success' => false,
                'error' => "Email could not be sent using PHP mail function"
            ];
        }
    } catch (Exception $e) {
        error_log("Mail Error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => "Email could not be sent. Error: {$e->getMessage()}"
        ];
    }
}
?> 