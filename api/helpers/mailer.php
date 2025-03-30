<?php
// Path to PHPMailer files - adjust if needed
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/autoload.php';  // Adjust path as needed

function sendEmail($to, $subject, $message) {
    // Create a new PHPMailer instance
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();                                      // Use SMTP
        $mail->Host       = 'smtp.gmail.com';                 // SMTP server
        $mail->SMTPAuth   = true;                             // Enable authentication
        $mail->Username   = 'petmanagementt@gmail.com';       // SMTP username
        $mail->Password   = 'ajlwvhzglwasoqku';               // SMTP password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;   // Enable TLS encryption
        $mail->Port       = 587;                              // TCP port to connect to

        // Recipients
        $mail->setFrom('petmanagementt@gmail.com', 'VetCare');
        $mail->addAddress($to);                               // Add recipient

        // Content
        $mail->isHTML(true);                                  // Set email format to HTML
        $mail->Subject = $subject;
        $mail->Body    = $message;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("PHPMailer Error: {$mail->ErrorInfo}");
        return false;
    }
}
?> 