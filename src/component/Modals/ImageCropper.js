import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, Alert } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

const ImageCropper = ({ visible, onClose, onImageCropped }) => {
  const [isModalVisible, setIsModalVisible] = useState(visible);

  // Function to handle image cropping
  const cropImage = async (source) => {
    try {
      const croppedImage = await ImagePicker.openCropper({
        path: source.uri,
        width: 1024,
        height: 1024,
        cropperCircleOverlay: false,
        compressImageQuality: 0.7,
        freeStyleCropEnabled: true,
        includeBase64: false,
        mediaType: 'photo',
      });

      if (croppedImage) {
        // Pass the cropped image back to the parent component
        onImageCropped({
          path: croppedImage.path,
          type: croppedImage.mime,
          size: croppedImage.size || 0,
        });
        setIsModalVisible(false);
        onClose();
      }
    } catch (error) {
      console.error('Image cropping error:', error);
      Alert.alert('Error', 'Failed to crop the image. Please try again.');
    }
  };

  // Function to handle image selection from gallery or camera
  const selectImage = async (type) => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
      };

      let response;
      if (type === 'camera') {
        response = await ImagePicker.openCamera(options);
      } else {
        response = await ImagePicker.openPicker(options);
      }

      if (response.path) {
        await cropImage(response);
      }
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        console.error('Image selection error:', error);
        Alert.alert('Error', 'Failed to select image. Please try again.');
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select and Crop Image</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => selectImage('camera')}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => selectImage('gallery')}
          >
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000',
  },
  button: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  cancelText: {
    color: '#777',
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
  },
});

export default ImageCropper;