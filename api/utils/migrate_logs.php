<?php
require_once 'Logger.php';

// Define root and logs path
$rootPath = dirname(dirname(dirname(__FILE__))); // PetFurMe-Application root
$logsPath = $rootPath . '/logs';

// List of specific log files to migrate
$logFiles = [
    '/api/messages/debug.log',
    '/api/appointments/appointment_errors.log',
    '/api/pets/debug.log'
];

// Map files to their new names in the logs directory
$fileMapping = [
    'debug.log' => 'messages.log',  // messages/debug.log -> messages.log
    'appointment_errors.log' => 'appointments.log', // appointment_errors.log -> appointments.log
    'debug.log' => 'pets.log'  // pets/debug.log -> pets.log
];

echo "Starting log migration...\n";
echo "Root path: $rootPath\n";
echo "Logs path: $logsPath\n\n";

// Ensure logs directory exists
if (!file_exists($logsPath)) {
    if (!mkdir($logsPath, 0777, true)) {
        die("Failed to create logs directory\n");
    }
}

// Migrate each log file
foreach ($logFiles as $logFile) {
    $sourcePath = $rootPath . $logFile;
    
    if (file_exists($sourcePath)) {
        echo "Processing: $logFile\n";
        
        // Read content
        $content = file_get_contents($sourcePath);
        if ($content === false) {
            echo "WARNING: Could not read $sourcePath\n";
            continue;
        }
        
        // Determine target file based on source directory
        $sourceDir = dirname($logFile);
        $sourceDir = basename($sourceDir); // Get the last directory name
        $targetFile = $fileMapping[basename($logFile)] ?? $sourceDir . '.log';
        $targetPath = $logsPath . '/' . $targetFile;
        
        // Append content to target file with source information
        $header = "\n\n=== Migrated from " . basename($logFile) . " at " . date('Y-m-d H:i:s') . " ===\n";
        if (file_put_contents($targetPath, $header . $content, FILE_APPEND)) {
            echo "Successfully migrated to: $targetFile\n";
            
            // Create backup of original file
            $backupPath = $sourcePath . '.migrated';
            if (rename($sourcePath, $backupPath)) {
                echo "Created backup: " . basename($backupPath) . "\n";
            } else {
                echo "WARNING: Could not create backup of $sourcePath\n";
            }
        } else {
            echo "ERROR: Failed to write to $targetPath\n";
        }
    } else {
        echo "Skipping (not found): $logFile\n";
    }
}

// Update permissions on all log files
$newLogFiles = glob($logsPath . '/*.log');
foreach ($newLogFiles as $logFile) {
    chmod($logFile, 0666);
    echo "Updated permissions for: " . basename($logFile) . "\n";
}

echo "\nMigration completed!\n";
echo "All logs have been consolidated in: $logsPath\n";
echo "Original log files have been backed up with '.migrated' extension\n";
?> 