<?php

class Appointment {
    private $conn;
    public $id;
    
    public function __construct($db) {
        $this->conn = $db;
    }

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
    
    // Add a method to update appointment details
    public function updateAppointment($id, $data) {
        // Update all appointment details
        $query = "UPDATE appointment 
                  SET pet_id = ?,
                      pet_name = ?,
                      pet_type = ?,
                      pet_age = ?,
                      reason_for_visit = ?,
                      appointment_date = ?,
                      appointment_time = ?,
                      status = 'pending',
                      updated_at = NOW()
                  WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        
        if (!$stmt) {
            return false;
        }
        
        // Bind parameters
        $stmt->bind_param(
            "issssssi",
            $data->pet_id,
            $data->pet_name,
            $data->pet_type,
            $data->pet_age,
            $data->reason_for_visit,
            $data->appointment_date,
            $data->appointment_time,
            $id
        );
        
        // Execute query
        if ($stmt->execute()) {
            $this->id = $id;
            return true;
        }
        
        return false;
    }
} 