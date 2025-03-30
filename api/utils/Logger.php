<?php
/**
 * Centralized logging utility
 */
class Logger {
    // Log levels
    const ERROR = 'ERROR';
    const WARNING = 'WARNING';
    const INFO = 'INFO';
    const DEBUG = 'DEBUG';
    
    // Configuration
    private static $debugEnabled = false;
    private static $logDir = null;
    private static $maxLogSize = 1048576; // 1MB
    private static $maxBackupFiles = 5;
    
    /**
     * Initialize the logger
     */
    public static function init($debugEnabled = false, $logDir = null) {
        self::$debugEnabled = $debugEnabled;
        self::$logDir = $logDir ?: dirname(__DIR__) . '/logs';
        
        // Create log directory if it doesn't exist
        if (!is_dir(self::$logDir)) {
            mkdir(self::$logDir, 0777, true);
        }
    }
    
    /**
     * Log a message with the specified level
     */
    public static function log($level, $message, $data = null, $file = 'application.log') {
        // Only log debug messages if debug is enabled
        if ($level === self::DEBUG && !self::$debugEnabled) {
            return;
        }
        
        $logFile = self::$logDir . '/' . $file;
        
        // Format the log message
        $formattedMessage = '[' . date('Y-m-d H:i:s') . '] [' . $level . '] ' . $message;
        if ($data !== null) {
            $formattedMessage .= "\nData: " . (is_string($data) ? $data : print_r($data, true));
        }
        $formattedMessage .= "\n----------------------------------------\n";
        
        try {
            // Implement log rotation
            self::rotateLogIfNeeded($logFile);
            
            // Write to log file
            file_put_contents($logFile, $formattedMessage, FILE_APPEND);
        } catch (Exception $e) {
            // Fallback to error_log
            error_log("Failed to write to log file: " . $e->getMessage());
        }
    }
    
    /**
     * Convenience method for error logs
     */
    public static function error($message, $data = null, $file = 'errors.log') {
        self::log(self::ERROR, $message, $data, $file);
    }
    
    /**
     * Convenience method for debug logs
     */
    public static function debug($message, $data = null, $file = 'debug.log') {
        self::log(self::DEBUG, $message, $data, $file);
    }
    
    /**
     * Rotate log file if it exceeds the maximum size
     */
    private static function rotateLogIfNeeded($logFile) {
        if (file_exists($logFile) && filesize($logFile) > self::$maxLogSize) {
            $backupFile = $logFile . '.' . date('Y-m-d-H-i-s') . '.bak';
            rename($logFile, $backupFile);
            touch($logFile);
            chmod($logFile, 0777);
            
            // Limit the number of backup files
            $pattern = preg_replace('/\.[^.]*$/', '', $logFile) . '.*.bak';
            $backupFiles = glob($pattern);
            if (count($backupFiles) > self::$maxBackupFiles) {
                usort($backupFiles, function($a, $b) {
                    return filemtime($a) - filemtime($b);
                });
                $filesToDelete = array_slice($backupFiles, 0, count($backupFiles) - self::$maxBackupFiles);
                foreach ($filesToDelete as $fileToDelete) {
                    unlink($fileToDelete);
                }
            }
        }
    }
    
    /**
     * Clear a log file
     */
    public static function clearLog($file) {
        $logFile = self::$logDir . '/' . $file;
        if (file_exists($logFile)) {
            file_put_contents($logFile, '');
        }
    }
}

// Initialize the logger with debug mode off by default
Logger::init(false); 