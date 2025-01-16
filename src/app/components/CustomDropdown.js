import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const CustomDropdown = ({ label, options, value, onSelect, placeholder }) => {
    const [visible, setVisible] = useState(false);

    return (
        <View>
            <TouchableOpacity 
                style={styles.dropdownButton} 
                onPress={() => setVisible(true)}
            >
                <Text style={[
                    styles.dropdownButtonText, 
                    !value && styles.placeholderText
                ]}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#8146C1" />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent={true}
                animationType="slide"
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => {
                                        onSelect(item);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        item === value && styles.selectedOption
                                    ]}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#bfbfbf',
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownButtonText: {
        fontSize: 14,
        color: '#000000',
    },
    placeholderText: {
        color: '#8146C1',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '50%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8146C1',
        marginBottom: 15,
    },
    optionItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionText: {
        fontSize: 16,
        color: '#000000',
    },
    selectedOption: {
        color: '#8146C1',
        fontWeight: 'bold',
    },
});

export default CustomDropdown; 