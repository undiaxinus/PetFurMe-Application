<?php
require_once __DIR__ . '/../utils/Logger.php';

// Define log files that can be automatically rotated
$logFiles = [
    'application.log',
    'appointments.log',
    'api.log',
    'error.log',
    'access.log',
    'debug.log'
];

// Set a retention policy (in days)
$retentionDays = 7;

// Process each log file
foreach ($logFiles as $logFile) {
    $fullPath = dirname(dirname(__FILE__)) . '/logs/' . $logFile;
    
    // Skip if file doesn't exist
    if (!file_exists($fullPath)) {
        continue;
    }
    
    // Check file size
    $size = filesize($fullPath) / 1024 / 1024; // Size in MB
    
    // If file is larger than 10MB, rotate it
    if ($size > 10) {
        $backupFile = $fullPath . '.' . date('Y-m-d-H-i-s') . '.bak';
        rename($fullPath, $backupFile);
        touch($fullPath);
        chmod($fullPath, 0666);
        echo "Rotated log file: $logFile (size: {$size}MB)\n";
    }
    
    // Delete old backup files
    $pattern = $fullPath . '.*.bak';
    $backupFiles = glob($pattern);
    
    foreach ($backupFiles as $backupFile) {
        $fileTime = filemtime($backupFile);
        $daysOld = (time() - $fileTime) / 86400; // 86400 = seconds in a day
        
        if ($daysOld > $retentionDays) {
            unlink($backupFile);
            echo "Deleted old backup: " . basename($backupFile) . " ({$daysOld} days old)\n";
        }
    }
}

echo "Log cleanup completed at " . date('Y-m-d H:i:s') . "\n"; 