<?php

namespace PHPMailer\PHPMailer;

/**
 * PHPMailer exception handler
 */
class Exception extends \Exception
{
    /**
     * Prettify error message output
     *
     * @return string
     */
    public function errorMessage()
    {
        return '<strong>' . htmlspecialchars($this->getMessage()) . "</strong><br />\n";
    }
} 