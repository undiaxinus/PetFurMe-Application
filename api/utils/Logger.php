<?php
class Logger {
    private static $logFile;
    private static $context;

    public static function init($context) {
        self::$context = $context;
        self::$logFile = __DIR__ . "/../logs/{$context}_" . date('Y-m-d') . ".log";
        
        // Ensure logs directory exists
        if (!file_exists(dirname(self::$logFile))) {
            mkdir(dirname(self::$logFile), 0777, true);
        }
    }

    private static function write($level, $message, $data = null) {
        $timestamp = date('Y-m-d H:i:s');
        $dataStr = $data ? json_encode($data, JSON_PRETTY_PRINT) : '';
        $logMessage = "[$timestamp][$level][" . self::$context . "] $message" . ($dataStr ? "\nData: $dataStr" : '') . "\n";
        
        file_put_contents(self::$logFile, $logMessage, FILE_APPEND);
    }

    public static function debug($message, $data = null) {
        self::write('DEBUG', $message, $data);
    }

    public static function info($message, $data = null) {
        self::write('INFO', $message, $data);
    }

    public static function warn($message, $data = null) {
        self::write('WARN', $message, $data);
    }

    public static function error($message, $data = null) {
        self::write('ERROR', $message, $data);
    }
}
?> 