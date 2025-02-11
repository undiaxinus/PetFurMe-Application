<?php
require_once __DIR__ . '/utils/Logger.php';

Logger::info('Test', 'Testing logging system');
Logger::debug('Test', 'Debug message');
Logger::error('Test', 'Error message');
Logger::access('Test', 'Access log test');

echo "Test logs written. Check the logs directory.\n";
?> 