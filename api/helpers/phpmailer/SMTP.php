<?php

namespace PHPMailer\PHPMailer;

class SMTP
{
    const VERSION = '6.5.0';
    const CRLF = "\r\n";
    const DEFAULT_PORT = 25;
    const MAX_LINE_LENGTH = 998;
    const DEBUG_OFF = 0;
    const DEBUG_CLIENT = 1;
    const DEBUG_SERVER = 2;
    const DEBUG_CONNECTION = 3;
    const DEBUG_LOWLEVEL = 4;

    public $do_debug = self::DEBUG_OFF;
    public $Debugoutput = 'echo';
    public $do_verp = false;
    public $Timeout = 300;
    public $Timelimit = 300;
    public $Host = 'localhost';
    public $Port = self::DEFAULT_PORT;
    public $Helo = '';
    public $Username = '';
    public $Password = '';
    public $AuthType = '';
    public $Realm = '';
    public $Workstation = '';
    public $Hostname = '';
    
    protected $smtp_conn;
    protected $error = [];
    protected $last_reply = '';
    protected $connected = false;
    
    public function connect($host, $port = null, $timeout = 30, $options = [])
    {
        try {
            if (is_null($port)) {
                $port = self::DEFAULT_PORT;
            }
            
            $this->smtp_conn = @fsockopen(
                $host,
                $port,
                $errno,
                $errstr,
                $timeout
            );
            
            if (empty($this->smtp_conn)) {
                $this->error = [
                    'error' => 'Failed to connect to server',
                    'errno' => $errno,
                    'errstr' => $errstr
                ];
                return false;
            }
            
            $this->connected = true;
            return true;
        } catch (\Exception $e) {
            $this->error = ['error' => $e->getMessage()];
            return false;
        }
    }
    
    public function authenticate($username, $password, $authtype = null, $realm = '', $workstation = '', $oauth_instance = null)
    {
        if (!$this->connected()) {
            return false;
        }
        
        $this->Username = $username;
        $this->Password = $password;
        $this->AuthType = $authtype;
        $this->Realm = $realm;
        $this->Workstation = $workstation;
        
        return true;
    }
    
    public function connected()
    {
        return $this->connected && !is_null($this->smtp_conn);
    }
    
    public function data($msg_data)
    {
        if (!$this->connected()) {
            return false;
        }
        
        return fwrite($this->smtp_conn, $msg_data . self::CRLF);
    }
    
    public function send($from, $to, $message)
    {
        if (!$this->connected()) {
            return false;
        }
        
        try {
            // Basic SMTP conversation
            $this->data("MAIL FROM:<$from>");
            $this->data("RCPT TO:<$to>");
            $this->data("DATA");
            $this->data($message);
            $this->data(".");
            
            return true;
        } catch (\Exception $e) {
            $this->error = ['error' => $e->getMessage()];
            return false;
        }
    }
    
    public function quit()
    {
        if ($this->connected()) {
            $this->data("QUIT");
        }
        $this->connected = false;
        return true;
    }
    
    public function close()
    {
        if (!is_null($this->smtp_conn)) {
            fclose($this->smtp_conn);
            $this->smtp_conn = null;
        }
        $this->connected = false;
        return true;
    }
    
    public function getError()
    {
        return $this->error;
    }
    
    public function getLastReply()
    {
        return $this->last_reply;
    }
} 