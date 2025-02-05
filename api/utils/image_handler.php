<?php
require_once '../config/constants.php';

class ImageHandler {
    public static function saveImage($file, $directory, $prefix = '') {
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        // Create directory if it doesn't exist
        $upload_dir = UPLOADS_ABSOLUTE_PATH . '/' . $directory;
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        // Generate unique filename
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = $prefix . '_' . uniqid() . '.' . $extension;
        $relative_path = $directory . '/' . $filename;
        $full_path = $upload_dir . '/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $full_path)) {
            chmod($full_path, 0644);
            return $relative_path;
        }

        return null;
    }
}
?> 