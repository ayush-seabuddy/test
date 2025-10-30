import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TextInput } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { ImagesAssets } from "../assets/ImagesAssets";
import Colors from "../colors/Colors";

const DropdownFieldIOS = ({
  label,
  options = [],
  selectedValue,
  onValueChange,
  error = "",
  icon = false,
  placeholder = "Select an option",
  isFocus,
  setIsFocus,
}) => {
  const [otherInput, setOtherInput] = useState("");

  // Determine if "Other" is selected
  const isOtherSelected =
    selectedValue?.toLowerCase?.() === "other" || (selectedValue && !options.some(opt => opt.value === selectedValue));

  // Create a new list of options with "Other"
  const extendedOptions = [...options];

  // Handle dropdown value change
  const handleValueChange = (value) => {
    if (value.toLowerCase() === "other") {
      setOtherInput("");
      onValueChange?.("other");
    } else {
      setOtherInput("");
      onValueChange?.(value);
    }
  };

  // Handle user input when "Other" is selected
  const handleOtherInputChange = (text) => {
    setOtherInput(text);
    onValueChange?.(text);
  };

  return (
    <View style={styles.dropdownContainer}>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "#007AFF" }]}
        data={extendedOptions}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={isOtherSelected ? "other" : selectedValue}
        onFocus={() => setIsFocus?.(true)}
        onBlur={() => setIsFocus?.(false)}
        selectedTextStyle={{ color: "#000" }}
        renderLeftIcon={() =>
          icon ? (
            <Image style={styles.icon} source={ImagesAssets.info_icon} />
          ) : null
        }
        renderRightIcon={() => (
          <Image
            style={styles.arrowIcon}
            source={
              isFocus
                ? ImagesAssets.arrow_up_icon
                : ImagesAssets.arrow_icon
            }
          />
        )}
        onChange={(item) => {
          setIsFocus?.(false);
          handleValueChange(item.value);
        }}
        renderItem={(item) => {
          const isSelected = selectedValue === item.value;
          return (
            <View
              style={[
                styles.itemContainer,
                isSelected && styles.selectedItemContainer,
              ]}
            >
              <Text
                style={[
                  styles.itemText,
                  isSelected && styles.selectedItemText,
                ]}
              >
                {item.label}
              </Text>
            </View>
          );
        }}
      />

      {/* Show text input if "Other" is selected */}
      {isOtherSelected && (
        <TextInput
          style={styles.textInput}
          placeholder="Enter your option"
          value={otherInput}
          onChangeText={handleOtherInputChange}
          placeholderTextColor="#999"
        />
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: { marginVertical: 10 },
  icon: { width: 20, height: 20, marginRight: 10 },
  arrowIcon: { width: 18, height: 18, marginRight: 10 },
  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20, // Increased for more rounded corners
    paddingHorizontal: 10,
    backgroundColor: "white",
    color: "black",
  },
  textInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20, // Increased for more rounded corners
    paddingHorizontal: 10,
    marginTop: 10,
    backgroundColor: "white",
    color: "black",
    fontSize: 16,
  },
  errorText: { color: "red", fontSize: 12, marginTop: 5 },
  itemContainer: {
    padding: 10,
    backgroundColor: "white",
  },
  selectedItemContainer: {
    backgroundColor: Colors.secondary,
  },
  itemText: {
    fontSize: 16,
    color: "#000",
  },
  selectedItemText: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default DropdownFieldIOS;