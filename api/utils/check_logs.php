<?php
header('Content-Type: text/plain');

$logsPath = __DIR__ . '/../../logs';
$logTypes = ['application', 'error', 'access', 'debug'];

function getLastLines($file, $lines = 100) {
    if (!file_exists($file)) return [];
    $file_arr = file($file);
    return array_slice($file_arr, -$lines);
}

// Get type from query parameter
$type = $_GET['type'] ?? 'all';
$filter = $_GET['filter'] ?? null;
$lines = $_GET['lines'] ?? 100;

echo "=== Log Viewer ===\n\n";

if ($type === 'all') {
    foreach ($logTypes as $logType) {
        $logFile = "$logsPath/$logType.log";
        if (file_exists($logFile)) {
            $fileSize = filesize($logFile);
            echo "\n=== $logType.log (" . round($fileSize / 1024, 2) . " KB) ===\n\n";
            
            $logLines = getLastLines($logFile, $lines);
            foreach ($logLines as $line) {
                if ($filter && stripos($line, $filter) === false) {
                    continue;
                }
                echo $line;
            }
        }
    }
} else if (in_array($type, $logTypes)) {
    $logFile = "$logsPath/$type.log";
    if (file_exists($logFile)) {
        $fileSize = filesize($logFile);
        echo "\n=== $type.log (" . round($fileSize / 1024, 2) . " KB) ===\n\n";
        
        $logLines = getLastLines($logFile, $lines);
        foreach ($logLines as $line) {
            if ($filter && stripos($line, $filter) === false) {
                continue;
            }
            echo $line;
        }
    }
}

// Handle log management actions
if (isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'clear':
            foreach ($logTypes as $logType) {
                $logFile = "$logsPath/$logType.log";
                if (file_exists($logFile)) {
                    file_put_contents($logFile, '');
                }
            }
            echo "\nAll logs cleared successfully\n";
            break;
            
        case 'rotate':
            $timestamp = date('Y-m-d-H-i-s');
            foreach ($logTypes as $logType) {
                $logFile = "$logsPath/$logType.log";
                if (file_exists($logFile)) {
                    $backup = "$logFile.$timestamp";
                    copy($logFile, $backup);
                    file_put_contents($logFile, '');
                }
            }
            echo "\nLogs rotated successfully\n";
            break;
    }
}
?> 
?> 