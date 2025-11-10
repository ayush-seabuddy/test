import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useField } from 'formik';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Updated import
import Colors from '../colors/Colors';

const CustomTextInput = ({ label, iconStart, iconEnd, secureTextEntry, ...props }) => {
  const [field, meta, helpers] = useField(props);
  const [isPasswordVisible, setIsPasswordVisible] = useState(secureTextEntry);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {iconStart && (
          <MaterialCommunityIcons 
            name={iconStart} 
            style={styles.icon} 
          />
        )}
        <TextInput
          style={styles.input}
          {...props}
          secureTextEntry={secureTextEntry && isPasswordVisible}
          onChangeText={helpers.setValue} // Pass Formik's setValue
          onBlur={() => helpers.setTouched(true)} // Pass Formik's setTouched
          value={field.value}
          placeholderTextColor={Colors.primary} // Change placeholder text color
        />
        {iconEnd && secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <MaterialCommunityIcons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              style={styles.icon} 
            />
          </TouchableOpacity>
        )}
      </View>
      {meta.touched && meta.error ? (
        <Text style={styles.errorText}>{meta.error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#333', // Input text color
  },
  icon: {
    fontSize: 20,
    color: Colors.primary, // Icon color
    marginHorizontal: 5,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
  },
});

export default CustomTextInput;
