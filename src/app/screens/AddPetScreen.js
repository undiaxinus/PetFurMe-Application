const handleSubmit = async () => {
    setIsLoading(true);
    try {
        // ... existing form data and validation code ...

        const response = await fetch(`${API_BASE_URL}/PetFurMe-Application/api/pets/add_pet.php`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Log activity only after successful pet addition
            await logActivity(
                ACTIVITY_TYPES.PET_ADDED,
                user_id,
                {
                    name: petName.trim(),
                    type: petType.toLowerCase(),
                    addedFields: [
                        'name',
                        'type',
                        petBreed && 'breed',
                        petAge && 'age',
                        petGender && 'gender',
                        petWeight && 'weight',
                        petSize && 'size',
                        petAllergies && 'allergies',
                        petNotes && 'notes',
                        photo && 'photo'
                    ].filter(Boolean)
                }
            );

            Alert.alert(
                'Success',
                'Pet added successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (route.params?.onComplete) {
                                route.params.onComplete();
                            }
                            navigation.goBack();
                        }
                    }
                ]
            );
        } else {
            throw new Error(result.message || 'Failed to add pet');
        }
    } catch (error) {
        console.error('Error adding pet:', error);
        Alert.alert('Error', 'Failed to add pet: ' + error.message);
    } finally {
        setIsLoading(false);
    }
}; 