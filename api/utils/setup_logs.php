<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define the root path (2 levels up from utils directory)
$rootPath = dirname(dirname(dirname(__FILE__))); // This gets to PetFurMe-Application root
$logsPath = $rootPath . '/logs';

echo "Current script path: " . __FILE__ . "\n";
echo "Root path: " . $rootPath . "\n";
echo "Attempting to set up logs in: " . $logsPath . "\n";

// Check if we have write permissions in the root directory
if (!is_writable($rootPath)) {
    die("ERROR: No write permission in root directory: $rootPath\n");
}

// Create main logs directory if it doesn't exist
if (!file_exists($logsPath)) {
    echo "Logs directory doesn't exist, creating...\n";
    if (!mkdir($logsPath, 0777, true)) {
        $error = error_get_last();
        die("ERROR: Failed to create logs directory: " . $error['message'] . "\n");
    }
    echo "Created logs directory successfully\n";
} else {
    echo "Logs directory already exists\n";
}

// Ensure the logs directory is writable
if (!is_writable($logsPath)) {
    chmod($logsPath, 0777);
    echo "Updated logs directory permissions\n";
}

// Create .htaccess to protect logs directory
$htaccess = $logsPath . '/.htaccess';
if (!file_exists($htaccess)) {
    $htaccessContent = "Order deny,allow\nDeny from all";
    if (file_put_contents($htaccess, $htaccessContent)) {
        echo "Created .htaccess protection\n";
    } else {
        echo "WARNING: Failed to create .htaccess\n";
    }
}

// Define log files
$logFiles = [
    'application.log',
    'error.log',
    'access.log',
    'debug.log',
    'api.log'
];

// Create and set permissions for each log file
foreach ($logFiles as $logFile) {
    $fullPath = $logsPath . '/' . $logFile;
    if (!file_exists($fullPath)) {
        echo "Creating $logFile...\n";
        if (touch($fullPath)) {
            chmod($fullPath, 0666);
            echo "Created and set permissions for: $logFile\n";
        } else {
            echo "WARNING: Failed to create $logFile\n";
        }
    } else {
        echo "$logFile already exists\n";
        // Ensure it's writable
        if (!is_writable($fullPath)) {
            chmod($fullPath, 0666);
            echo "Updated permissions for: $logFile\n";
        }
    }
}

// Test writing to each log file
foreach ($logFiles as $logFile) {
    $fullPath = $logsPath . '/' . $logFile;
    if (file_put_contents($fullPath, date('Y-m-d H:i:s') . " - Test log entry\n", FILE_APPEND)) {
        echo "Successfully wrote to $logFile\n";
    } else {
        echo "WARNING: Failed to write to $logFile\n";
    }
}

echo "\nSetup completed!\n";
echo "Logs directory: $logsPath\n";
echo "Please check that all files were created correctly.\n";
?> 