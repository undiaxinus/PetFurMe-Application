<?php
// Prevent any output before headers
error_reporting(E_ALL);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once '../config/database.php';

// Update the debugLog function
function debugLog($message, $data = null) {
    try {
        // Only log if debugging is enabled - you can control this with a constant or config
        if (!defined('DEBUG_ENABLED') || !DEBUG_ENABLED) {
            return;
        }
        
        $logMessage = "[" . date('Y-m-d H:i:s') . "] " . $message;
        if ($data !== null) {
            $logMessage .= "\nData: " . print_r($data, true);
        }
        $logMessage .= "\n----------------------------------------\n";
        
        $logDir = __DIR__ . '/../logs';
        $logFile = $logDir . '/appointment_debug.log';
        
        // Check if directory exists, if not create it
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }
        
        // Check if file exists, if not create it
        if (!file_exists($logFile)) {
            touch($logFile);
            chmod($logFile, 0777);
        }
        
        // Implement log rotation - check file size
        if (file_exists($logFile) && filesize($logFile) > 1024 * 1024) { // 1MB limit
            $backupFile = $logFile . '.' . date('Y-m-d-H-i-s') . '.bak';
            rename($logFile, $backupFile);
            touch($logFile);
            chmod($logFile, 0777);
            
            // Limit the number of backup files (keep last 5)
            $backupFiles = glob($logDir . '/appointment_debug.log.*.bak');
            if (count($backupFiles) > 5) {
                usort($backupFiles, function($a, $b) {
                    return filemtime($a) - filemtime($b);
                });
                $filesToDelete = array_slice($backupFiles, 0, count($backupFiles) - 5);
                foreach ($filesToDelete as $fileToDelete) {
                    unlink($fileToDelete);
                }
            }
        }
        
        // Add error logging to see if file is writable
        if (!is_writable($logFile)) {
            error_log("Log file is not writable: " . $logFile);
            return;
        }
        
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    } catch (Exception $e) {
        error_log("Error writing to debug log: " . $e->getMessage());
    }
}

// Define DEBUG_ENABLED constant to control logging
define('DEBUG_ENABLED', false); // Set to true only when debugging is needed

// Wrap everything in an output buffer to catch any unexpected output
ob_start();

try {
    // Only log if debugging is enabled
    if (DEBUG_ENABLED) {
        debugLog("Starting appointment fetch process");
    }
    
    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }

    $user_id = intval($_GET['user_id']);
    if ($user_id <= 0) {
        throw new Exception('Invalid user ID');
    }

    // Log only in debug mode and only once per request
    if (DEBUG_ENABLED) {
        debugLog("Processing request for user_id: " . $user_id);
    }

    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Removed excessive debugging here
    
    $query = "
        SELECT 
            a.id as appointment_id,
            a.appointment_date,
            TIME_FORMAT(a.appointment_time, '%H:%i') as appointment_time,
            a.reason_for_visit as reason,
            a.pet_name,
            a.pet_id,
            a.status
        FROM appointment a
        WHERE a.user_id = ?
        AND (
            a.appointment_date > CURDATE() 
            OR (
                a.appointment_date = CURDATE() 
                AND a.appointment_time >= CURTIME()
            )
        )
        AND a.deleted_at IS NULL
        AND a.status IN ('pending', 'confirmed')
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
        LIMIT 10
    ";

    // We'll only keep critical logs and make them conditional
    $stmt = $db->prepare($query);

    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $db->error);
    }

    $stmt->bind_param("i", $user_id);

    if (!$stmt->execute()) {
        throw new Exception('Failed to execute query: ' . $stmt->error);
    }

    $result = $stmt->get_result();
    $appointments = [];
    
    while ($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
    
    // Log appointment count only when debugging
    if (DEBUG_ENABLED && count($appointments) > 0) {
        debugLog("Fetched " . count($appointments) . " appointments");
    }

    // Process appointments
    $processed_appointments = [];
    foreach ($appointments as $appointment) {
        try {
            $reason = json_decode($appointment['reason'], true);
            $appointment['reason'] = is_array($reason) ? $reason : [];
            $processed_appointments[] = $appointment;
        } catch (Exception $e) {
            // Still log errors, even in production
            error_log("Error processing appointment " . $appointment['appointment_id'] . ": " . $e->getMessage());
            $appointment['reason'] = [];
            $processed_appointments[] = $appointment;
        }
    }

    $stmt->close();
    ob_clean();
    
    $response = [
        'success' => true,
        'appointments' => $processed_appointments
    ];
    
    // Only log response in debug mode
    if (DEBUG_ENABLED) {
        debugLog("Sending response with " . count($processed_appointments) . " appointments");
    }
    echo json_encode($response);

} catch (Exception $e) {
    ob_clean();
    
    $error_response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    
    // In production, don't include detailed debug info
    if (DEBUG_ENABLED) {
        $error_response['debug_info'] = [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ];
        
        debugLog("Error occurred: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
    }
    
    // Always log actual errors to error_log
    error_log("Appointment fetch error: " . $e->getMessage());
    
    echo json_encode($error_response);
}

// End output buffering
ob_end_flush();
?> 