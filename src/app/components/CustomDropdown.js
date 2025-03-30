import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const CustomDropdown = ({ label, options, value, onSelect, placeholder, style, headerText }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (item) => {
        onSelect(item);
        setIsOpen(false);
    };

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity 
                style={[
                    styles.dropdownButton,
                    value ? styles.dropdownButtonWithValue : null
                ]} 
                onPress={() => setIsOpen(!isOpen)}
            >
                {value ? (
                    <Text style={styles.selectedValueText}>{value}</Text>
                ) : (
                    <Text style={styles.placeholderText}>{placeholder}</Text>
                )}
                <MaterialIcons 
                    name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color="#8146C1" 
                />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Select {label}</Text>
                                    <TouchableOpacity 
                                        onPress={() => setIsOpen(false)}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={24} color="#666666" />
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={options}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity 
                                            onPress={() => handleSelect(item)} 
                                            style={[
                                                styles.option,
                                                item === value && styles.optionSelected
                                            ]}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                item === value && styles.optionTextSelected
                                            ]}>
                                                {item}
                                            </Text>
                                            {item === value && (
                                                <Ionicons 
                                                    name="checkmark" 
                                                    size={20} 
                                                    color="#8146C1" 
                                                />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    style={styles.optionsList}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
    },
    dropdown: {
        height: 42,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    dropdownLabel: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    required: {
        color: '#8146C1',
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    dropdownButtonWithValue: {
        borderColor: '#8146C1',
        borderWidth: 2,
    },
    headerText: {
        fontSize: 16,
        color: '#333333',
    },
    placeholderText: {
        fontSize: 16,
        color: '#A3A3A3',
    },
    optionsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginTop: 4,
        zIndex: 1000,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    option: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    optionText: {
        fontSize: 16,
        color: '#333333',
    },
    selectedOptionText: {
        color: '#8146C1',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: '100%',
        maxHeight: '80%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8146C1',
    },
    closeButton: {
        padding: 4,
    },
    optionsList: {
        paddingVertical: 8,
    },
    optionSelected: {
        backgroundColor: '#F8F5FF',
    },
    optionTextSelected: {
        color: '#8146C1',
        fontWeight: '500',
    },
    selectedValueText: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
    },
});

export default CustomDropdown; 