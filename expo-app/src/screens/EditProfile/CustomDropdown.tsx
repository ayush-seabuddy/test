import React, { useEffect, useState } from "react";
import { Keyboard, StyleSheet, View, ViewStyle } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

/** Type for each dropdown item */
export interface DropdownItem {
  label: string;
  value: string | number;
}

/** Props for CustomDropdown */
interface CustomDropdownProps {
  data: DropdownItem[];
  placeholder?: string;
  value: string | number | null;
  onChange: (value: string ) => void;
  style?: ViewStyle;
  dropdownStyle?: ViewStyle;
  renderLeftIcon?: () => React.ReactNode;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  data,
  placeholder = "Select an option",
  value,
  onChange,
  style,
  dropdownStyle,
  renderLeftIcon,
}) => {
  console.log("data: ", data);
  const [isFocus, setIsFocus] = useState<boolean>(false);

  useEffect(() => {
    if (isFocus) Keyboard.dismiss();
  }, [isFocus]);

  return (
    <Dropdown
      style={[
        styles.dropdown,
        dropdownStyle,
        isFocus && { borderColor: "blue" },
      ]}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={[
        styles.selectedTextStyle,
        { color: value === "" || value === null ? "#c1c1c1" : "#000" },
      ]}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      value={value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={(item: DropdownItem) => {
        onChange(String(item.value));
        setIsFocus(false);
      }}
      renderLeftIcon={() => (
        <View style={{ marginRight: 12 }}>
          {renderLeftIcon ? renderLeftIcon() : null}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
     borderRadius: 10,
    width: "92%",
    paddingHorizontal: 8,
  },

  placeholderStyle: {
    fontSize: 15,
    color: "#c1c1c1",
    fontFamily: "Poppins-Regular",
    paddingLeft: 10,
  },

  selectedTextStyle: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    paddingLeft: 10,
  },

  iconStyle: {
    width: 20,
    height: 20,
  },

  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default CustomDropdown;
