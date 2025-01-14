import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PopUp = ({ isVisible, onClose, message, navigation }) => {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Drawer Access */}
        <TouchableOpacity style={styles.drawerButton} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={30} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.modalContent}>
          <Ionicons name="checkmark-circle" size={60} color="#8146C1" />
          <Text style={styles.modalText}>{message || 'Added to cart'}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8146C1',
    marginTop: 10,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#8146C1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PopUp;
