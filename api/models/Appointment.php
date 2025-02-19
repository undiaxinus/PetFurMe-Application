<?php

class Appointment {
    public function updateStatus($id, $status) {
        $query = "UPDATE appointment 
                  SET status = ?, 
                      updated_at = NOW() 
                  WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        
        if (!$stmt) {
            return false;
        }

        // Bind parameters
        $stmt->bind_param("si", $status, $id);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }
} 