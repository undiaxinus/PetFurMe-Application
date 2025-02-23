import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const CustomDropdown = ({ label, options, value, onSelect, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (item) => {
        onSelect(item);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                onPress={() => setIsOpen(!isOpen)} 
                style={[styles.dropdown, value && styles.dropdownSelected]}
            >
                <Text style={[
                    styles.dropdownText,
                    !value && styles.placeholderText,
                    value && styles.selectedText
                ]}>
                    {value || placeholder}
                </Text>
                <Ionicons 
                    name={isOpen ? "chevron-up" : "chevron-down"} 
                    size={20} 
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
                                    <Text style={styles.modalTitle}>{label}</Text>
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
        marginBottom: 16,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
    },
    dropdownSelected: {
        borderColor: '#8146C1',
    },
    dropdownText: {
        fontSize: 14,
        color: '#2D3748',
    },
    placeholderText: {
        color: '#A3A3A3',
    },
    selectedText: {
        color: '#2D3748',
        fontWeight: '500',
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
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingHorizontal: 20,
    },
    optionSelected: {
        backgroundColor: '#F8F5FF',
    },
    optionText: {
        fontSize: 15,
        color: '#2D3748',
    },
    optionTextSelected: {
        color: '#8146C1',
        fontWeight: '500',
    },
});

export default CustomDropdown; 