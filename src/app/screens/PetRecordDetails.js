import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SERVER_IP } from '../config/constants';

const API_BASE_URL = `http://${SERVER_IP}`;

const PetRecordDetails = ({ route, navigation }) => {
  const { appointmentId, medicalId, petName, date } = route.params;
  const [loading, setLoading] = useState(true);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [error, setError] = useState(null);
  
  console.log('PetRecordDetails Route Params:', route.params); // Debug logging
  
  useEffect(() => {
    const fetchMedicalRecord = async () => {
      setLoading(true);
      
      try {
        console.log('Fetching medical record:', medicalId); // Debug logging
        const response = await fetch(
          `${API_BASE_URL}/PetFurMe-Application/api/pets/get_record_details.php?record_type=medical&record_id=${medicalId}`
        );
        
        const data = await response.json();
        console.log('API response:', data); // Debug logging
        
        if (data.success) {
          setMedicalRecord(data.record);
        } else {
          setError(data.message || 'Failed to fetch record details');
        }
      } catch (err) {
        console.error('Error fetching record details:', err);
        setError('Failed to fetch record details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (medicalId) {
      fetchMedicalRecord();
    } else {
      setLoading(false);
      setError('No medical record ID provided');
    }
  }, [medicalId]);
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8146C1" />
          <Text style={styles.loadingText}>Loading record details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record Details</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // If we don't have data after loading is complete
  if (!medicalRecord) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record Details</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="document-text-outline" size={48} color="#666" />
          <Text style={styles.noDataText}>No record details available.</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Parse findings data
  let findingsData = {};
  try {
    if (typeof medicalRecord.findings_data === 'string') {
      findingsData = JSON.parse(medicalRecord.findings_data);
      // Handle double-encoded JSON
      if (typeof findingsData === 'string') {
        findingsData = JSON.parse(findingsData);
      }
    } else if (medicalRecord.findings_data) {
      findingsData = medicalRecord.findings_data;
    }
  } catch (e) {
    console.error('Error parsing findings data:', e);
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Record</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.container}>
        <View style={styles.petInfoCard}>
          <Text style={styles.petName}>{petName || medicalRecord.pet_name}</Text>
          <Text style={styles.recordDate}>{date || medicalRecord.appointment_date}</Text>
        </View>
        
        {/* Vaccination section */}
        {findingsData.vaccination_type && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Vaccination</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>{findingsData.vaccination_type}</Text>
            </View>
            {findingsData.vaccination_batch_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Batch #:</Text>
                <Text style={styles.infoValue}>{findingsData.vaccination_batch_number}</Text>
              </View>
            )}
            {findingsData.vaccination_date_given && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date Given:</Text>
                <Text style={styles.infoValue}>{findingsData.vaccination_date_given}</Text>
              </View>
            )}
            {findingsData.vaccination_administered_by && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Administered By:</Text>
                <Text style={styles.infoValue}>{findingsData.vaccination_administered_by}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Diagnosis section */}
        {(medicalRecord.diagnosis || findingsData.diagnosis) && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Diagnosis</Text>
            <Text style={styles.contentText}>
              {medicalRecord.diagnosis || findingsData.diagnosis}
            </Text>
          </View>
        )}
        
        {/* Treatment Plan */}
        {(medicalRecord.treatment_plan || findingsData.treatment_plan) && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Treatment Plan</Text>
            <Text style={styles.contentText}>
              {medicalRecord.treatment_plan || findingsData.treatment_plan}
            </Text>
          </View>
        )}
        
        {/* Recommendations */}
        {medicalRecord.recommendations && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Recommendations</Text>
            <Text style={styles.contentText}>{medicalRecord.recommendations}</Text>
          </View>
        )}
        
        {/* Additional Notes */}
        {medicalRecord.additional_notes && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Additional Notes</Text>
            <Text style={styles.contentText}>{medicalRecord.additional_notes}</Text>
          </View>
        )}
        
        {/* Created by */}
        {medicalRecord.created_by_name && (
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              Record created by {medicalRecord.created_by_name} on {new Date(medicalRecord.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  petInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  contentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  footerInfo: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 24,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#8146C1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PetRecordDetails; 