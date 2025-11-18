import React from "react";
import type { ReactElement } from "react";
import {
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  Text,
} from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
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

  renderRightIcon?: (visible?: boolean) => ReactElement | null;
  renderSelectedItem?: (item: T) => string;
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

  renderRightIcon,
  renderSelectedItem,
}: GlobalDropdownProps<T>) => {
  /* -------------------------------------------------------------
   *  Trigger text: show selected labels (max 3)
   * ------------------------------------------------------------- */
  const getTriggerText = () => {
    if (!value) return placeholder;

    if (!multiple) {
      const selected = data.find((i) => i[valueField] === value);
      return selected ? String(selected[labelField]) : placeholder;
    }

    const selectedItems = data.filter((i) => value.includes(i[valueField]));
    if (selectedItems.length === 0) return placeholder;

    const labels = selectedItems.map((i) =>
      renderSelectedItem ? renderSelectedItem(i) : String(i[labelField])
    );

    return labels.slice(0, 3).join(", ") + (labels.length > 3 ? "…" : "");
  };

  /* -------------------------------------------------------------
   *  Right icon – Arrow Up when open, Arrow Down when closed
   *  For multi-select: show Check when something is selected
   * ------------------------------------------------------------- */
  const defaultRightIcon = (visible?: boolean): ReactElement | null => {
    const isOpen = !!visible;

    if (!multiple) {
      // Single-select – always arrow (down when closed, up when open)
      return isOpen ? (
        <ChevronUp size={20} color={Colors.white} />
      ) : (
        <ChevronDown size={20} color={Colors.white} />
      );
    }

    // Multi-select
    const hasSelection = Array.isArray(value) && value.length > 0;

    if (hasSelection) {
      // Keep Check even when dropdown is open
      return <Check size={20} color={Colors.white} />;
    }

    // No selection – show arrow (up/down)
    return isOpen ? (
      <ChevronUp size={20} color={Colors.white} />
    ) : (
      <ChevronDown size={20} color={Colors.white} />
    );
  };

  const finalRightIcon = renderRightIcon
    ? (visible?: boolean): ReactElement | null => renderRightIcon(visible)
    : defaultRightIcon;

  /* -------------------------------------------------------------
   *  Render item (unchanged)
   * ------------------------------------------------------------- */
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

  /* -------------------------------------------------------------
   *  Render MultiSelect or Dropdown
   * ------------------------------------------------------------- */
  return (
    <View style={[styles.container, containerStyle]}>
      {multiple ? (
        <MultiSelect
          style={[styles.dropdown, dropdownStyle]}
          data={data}
          labelField={String(labelField)}
          valueField={String(valueField)}
          placeholder={getTriggerText()}
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
          visibleSelectedItem={false}
          renderRightIcon={finalRightIcon}
        />
      ) : (
        <Dropdown
          style={[styles.dropdown, dropdownStyle]}
          data={data}
          labelField={String(labelField)}
          valueField={String(valueField)}
          placeholder={getTriggerText()}
          search={searchable}
          value={value}
          onChange={(item) => onChange(item[valueField])}
          disable={disable}
          placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
          selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle]}
          itemTextStyle={[styles.itemTextStyle, itemTextStyle]}
          iconColor={Colors.white}
          renderItem={renderItem}
          renderRightIcon={finalRightIcon}
        />
      )}
    </View>
  );
};

export default GlobalDropdown;

/* ----------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { width: "100%" },
  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  placeholderStyle: { fontSize: 14, color: "white" },
  selectedTextStyle: { fontSize: 14, color: "white" },
  itemTextStyle: { fontSize: 14, color: "white" },
  selectedStyle: { borderRadius: 12 },
  itemContainer: { padding: 12, backgroundColor: "white" },
  selectedItemText: { fontWeight: "bold" },
  itemText: {
    fontSize: 14,
    color: "#262626",
    fontFamily: "Poppins-Regular",
  },
});