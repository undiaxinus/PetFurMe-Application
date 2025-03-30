<?php
$rootDir = dirname(dirname(__DIR__));
$logFiles = [];

function findLogFiles($dir) {
    global $logFiles;
    $files = scandir($dir);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $path = $dir . DIRECTORY_SEPARATOR . $file;
        
        if (is_dir($path)) {
            findLogFiles($path);
        } else if (
            // Match common log file extensions
            preg_match('/\.(log|logs)$/i', $file) || 
            // Match common log file names
            preg_match('/(error|debug|access|request)/', $file)
        ) {
            $size = filesize($path) / 1024; // Size in KB
            $logFiles[] = [
                'path' => str_replace($rootDir . DIRECTORY_SEPARATOR, '', $path),
                'size' => round($size, 2) . ' KB',
                'last_modified' => date('Y-m-d H:i:s', filemtime($path))
            ];
        }
    }
}

// Start the search from the API directory
findLogFiles($rootDir);

// Sort by size descending
usort($logFiles, function($a, $b) {
    return (float)$b['size'] - (float)$a['size'];
});

// Output the results
echo "Found " . count($logFiles) . " log files:\n\n";
echo str_pad("Size", 15) . str_pad("Last Modified", 25) . "Path\n";
echo str_repeat("-", 80) . "\n";

foreach ($logFiles as $log) {
    echo str_pad($log['size'], 15) . str_pad($log['last_modified'], 25) . $log['path'] . "\n";
} 