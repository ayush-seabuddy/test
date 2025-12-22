import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Platform,
    ScrollView
} from 'react-native'
import React, { useState } from 'react'
import { Image } from 'expo-image'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import Colors from '@/src/utils/Colors'
import { useTranslation } from 'react-i18next'
import { showToast } from '@/src/components/GlobalToast'
import { createcustomcategory, uploadfile } from '@/src/apis/apiService'
import * as ImagePicker from 'expo-image-picker'
import { SquarePen, X } from 'lucide-react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

interface CreateCustomCategoryModalProps {
    visible: boolean
    onClose: () => void
    onCategoryCreated: (category: any) => void
}

const CreateCustomCategoryModal = ({
    visible,
    onClose,
    onCategoryCreated
}: CreateCustomCategoryModalProps) => {
    const { t } = useTranslation()
    const [categoryName, setCategoryName] = useState('')
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [imageUploading, setImageUploading] = useState(false)

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })

            if (!result.canceled && result.assets?.length) {
                const asset = result.assets[0]
                setSelectedImage(asset.uri)
            }
        } catch (error) {
            console.error('Error picking image:', error)
            showToast.error(t('error'), t('imagePickFailed'))
        }
    }

    const removeImage = () => {
        setSelectedImage(null)
    }

    const handleCreateCategory = async () => {
        if (!categoryName.trim()) {
            showToast.error(t('oops'), t('please_enter_category_name'))
            return
        }

        setLoading(true)
        let imageUrl = ''

        try {
            if (selectedImage) {
                setImageUploading(true)
                const uploadResponse = await uploadfile({ file: selectedImage })

                if (uploadResponse.success && uploadResponse.status === 200) {
                    imageUrl = uploadResponse.data
                } else {
                    showToast.error(
                        t('oops'),
                        uploadResponse.message || t('failedtouploadimage')
                    )
                    setLoading(false)
                    setImageUploading(false)
                    return
                }
                setImageUploading(false)
            }

            const apiResponse = await createcustomcategory({
                categoryName: categoryName.trim(),
                categoryImage: imageUrl
            })

            if (apiResponse.success && apiResponse.status === 200) {
                const newCategory = {
                    id: apiResponse.data?.id || Date.now().toString(),
                    categoryName: categoryName.trim(),
                    categoryImage: imageUrl,
                    points: '0',
                    creatorPoints: '0',
                    isAdmin: false,
                    isDefault: false,
                    label: categoryName.trim(),
                    value: apiResponse.data?.id || Date.now().toString(),
                }

                onCategoryCreated(newCategory)
                resetForm()
                showToast.success(t('success'), t('categorycreatedsuccessfully'))
            } else {
                showToast.error(
                    t('oops'),
                    apiResponse.message || t('failedtocreatecategory')
                )
            }
        } catch (err) {
            console.error('Error creating category:', err)
            showToast.error(t('oops'), t('somethingwentwrong'))
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setCategoryName('')
        setSelectedImage(null)
        setLoading(false)
        setImageUploading(false)
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <KeyboardAwareScrollView
                enableOnAndroid
                keyboardShouldPersistTaps="handled"
                extraScrollHeight={Platform.OS === 'ios' ? 20 : 80}
                contentContainerStyle={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('createnewcategory')}</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={20} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer}>
                        {/* Category Image */}
                        <View style={styles.imageSection}>
                            <Text style={styles.sectionLabel}>{t('choosecategoryimage')}</Text>

                            <View style={styles.imageContainer}>
                                <Image
                                    source={
                                        selectedImage
                                            ? { uri: selectedImage }
                                            : ImagesAssets.PlaceholderImage
                                    }
                                    style={styles.categoryImage}
                                    contentFit="cover"
                                />

                                <TouchableOpacity
                                    style={styles.editImageButton}
                                    onPress={selectedImage ? removeImage : pickImage}
                                >
                                    <SquarePen
                                        strokeWidth={1.5}
                                        size={16}
                                        color={
                                            selectedImage
                                                ? Colors.error
                                                : Colors.lightGreen
                                        }
                                    />
                                </TouchableOpacity>
                            </View>

                            {selectedImage && (
                                <Text style={styles.removeText} onPress={removeImage}>
                                    {t('remove')}
                                </Text>
                            )}
                        </View>

                        {/* Category Name */}
                        <View style={styles.inputSection}>
                            <Text style={styles.sectionLabel}>
                                {t('categoryName')} *
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('entercategoryname')}
                                placeholderTextColor="grey"
                                value={categoryName}
                                onChangeText={setCategoryName}
                                maxLength={50}
                            />
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleClose}
                                disabled={loading}
                            >
                                <Text style={styles.cancelButtonText}>
                                    {t('cancel')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.createButton,
                                    (!categoryName.trim() || loading) &&
                                        styles.disabledButton,
                                ]}
                                onPress={handleCreateCategory}
                                disabled={!categoryName.trim() || loading}
                            >
                                {loading || imageUploading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.createButtonText}>
                                        {t('create')}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAwareScrollView>
        </Modal>
    )
}

export default CreateCustomCategoryModal

const styles = StyleSheet.create({
    modalContainer: {
        flexGrow: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#ededed',
    },
    title: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#000',
    },
    closeButton: {
        padding: 4,
    },
    formContainer: {
        padding: 20,
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    imageContainer: {
        position: 'relative',
        width: 120,
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ededed',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    editImageButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#fff',
        padding: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ededed',
    },
    removeText: {
        marginTop: 8,
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: Colors.error,
        textDecorationLine: 'underline',
    },
    inputSection: {
        marginBottom: 32,
    },
    textInput: {
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 0.3,
        borderColor: 'grey',
        paddingHorizontal: 12,
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#000',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
    },
    button: {
        flex: 1,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#666',
    },
    createButton: {
        backgroundColor: Colors.lightGreen,
    },
    disabledButton: {
        backgroundColor: '#aaaaaa',
    },
    createButtonText: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#fff',
    },
})
