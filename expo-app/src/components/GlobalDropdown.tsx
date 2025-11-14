import React from "react";
import { StyleSheet, View, ViewStyle, TextStyle, Text } from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import Colors from "../utils/Colors";

type DropdownItem = {
    label: string;
    value: string;
};

type GlobalDropdownProps<T> = {
    data: T[];
    value: any;
    onChange: (value: any) => void;

    placeholder?: string;
    labelField: keyof T;
    valueField: keyof T;
    searchable?: boolean;
    multiple?: boolean;
    containerStyle?: ViewStyle;
    dropdownStyle?: ViewStyle;
    placeholderStyle?: TextStyle;
    selectedTextStyle?: TextStyle;
    itemTextStyle?: TextStyle;
    selectedItemStyle?: ViewStyle;
    iconColor?: string;
    disable?: boolean;

};

const GlobalDropdown = <T,>({
    data,
    value,
    onChange,

    placeholder = "Select an option",
    labelField,
    valueField,

    searchable = false,
    multiple = false,

    containerStyle,
    dropdownStyle,
    placeholderStyle,
    selectedTextStyle,
    itemTextStyle,
    selectedItemStyle,
    iconColor = "#000",

    disable = false,
}: GlobalDropdownProps<T>) => {
    const renderItem = (item: T) => {
        const itemValue = item[valueField];
        const isSelected = multiple
            ? Array.isArray(value) && value.includes(itemValue)
            : value === itemValue;

        return (
            <View
                style={[
                    styles.itemContainer,
                    isSelected && { backgroundColor: Colors.lightGreen },
                    isSelected && selectedItemStyle,
                ]}
            >
                <Text
                    style={[
                        styles.itemText,
                        itemTextStyle,
                        isSelected && styles.selectedItemText,
                    ]}
                >
                    {String(item[labelField])}
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {multiple ? (
                <MultiSelect
                    style={[styles.dropdown, dropdownStyle]}
                    data={data}
                    labelField={String(labelField)}
                    valueField={String(valueField)}
                    placeholder={placeholder}
                    search={searchable}
                    value={value}
                    onChange={(items) => onChange(items)}
                    disable={disable}
                    placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
                    selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle]}
                    itemTextStyle={[styles.itemTextStyle, itemTextStyle]}
                    selectedStyle={styles.selectedStyle}
                    iconColor={Colors.white}
                    renderItem={renderItem}
                />
            ) : (
                <Dropdown
                    style={[styles.dropdown, dropdownStyle]}
                    data={data}
                    labelField={String(labelField)}
                    valueField={String(valueField)}
                    placeholder={placeholder}
                    search={searchable}
                    value={value}
                    onChange={(item) => onChange(item[valueField])}
                    disable={disable}
                    placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
                    selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle]}
                    itemTextStyle={[styles.itemTextStyle, itemTextStyle]}
                    iconColor={Colors.white}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
};

export default GlobalDropdown;

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    dropdown: {
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    placeholderStyle: {
        fontSize: 14,
        color: "white",
    },
    selectedTextStyle: {
        fontSize: 14,
        color: "white",
    },
    itemTextStyle: {
        fontSize: 14,
        color: "white",
    },
    selectedStyle: {
        borderRadius: 12,
    },
    itemContainer: {
        padding: 12,
        backgroundColor: "white",
    },
    selectedItemText: {
        fontWeight: "bold",
    },
    itemText: {
        fontSize: 14,
        color: "#262626",
        fontFamily: "Poppins-Regular",
    },

});
