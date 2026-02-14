
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import { Dimensions, Modal, Platform, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle, } from "react-native";

const { width, height } = Dimensions.get("window");

export interface CustomDateTimePickerProps {
  value: Date;
  mode?: "date" | "time" | "datetime";
  onChange: (event: any, date?: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  display?: "default" | "spinner" | "calendar" | "clock";
  cancelText?: string;
  confirmText?: string;
  containerStyle?: ViewStyle;
  pickerStyle?: ViewStyle;
  toolbarStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  isVisible?: boolean;
  onClose?: () => void;
  useBlur?: boolean;
  backgroundOpacity?: number;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  value,
  mode = "date",
  onChange,
  minimumDate,
  maximumDate,
  display = Platform.OS === "ios" ? "spinner" : "default",
  cancelText = "Cancel",
  confirmText = "Done",
  containerStyle,
  pickerStyle,
  toolbarStyle,
  buttonStyle,
  buttonTextStyle,
  isVisible = false,
  onClose,
  useBlur = false,
  backgroundOpacity = 0.3,
}) => {
  const [internalVisible, setInternalVisible] = useState(isVisible);
  const [tempValue, setTempValue] = useState<Date>(value);

  const handlePickerChange = (
    event: any,
    selectedDate?: Date
  ) => {
    if (selectedDate) {
      setTempValue(selectedDate);

      if (Platform.OS === "android") {
        onChange(event, selectedDate);
        setInternalVisible(false);
        onClose?.();
      }
    }
  };

  const handleConfirm = () => {
    onChange({ type: "set" } as any, tempValue);
    setInternalVisible(false);
    onClose?.();
  };

  const handleCancel = () => {
    setTempValue(value);
    setInternalVisible(false);
    onClose?.();
  };

  useEffect(() => {
    if (isVisible) {
      setInternalVisible(true);
      setTempValue(value);
    } else {
      setInternalVisible(false);
    }
  }, [isVisible, value]);

  // ANDROID (inline picker)
  if (Platform.OS === "android") {
    return internalVisible ? (
      <DateTimePicker
        value={tempValue}
        mode={mode}
        display={display}
        onChange={handlePickerChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    ) : null;
  }

  // IOS (modal picker)
  return (
    <Modal
      visible={internalVisible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalContainer}>
        {useBlur && (
          <BlurView
            intensity={50}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        )}

        {!useBlur && (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `rgba(0,0,0,${backgroundOpacity})` },
            ]}
          />
        )}

        <View style={[styles.pickerContainer, containerStyle]}>
          <View style={[styles.toolbar, toolbarStyle]}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.button, buttonStyle]}
            >
              <Text style={[styles.toolbarButton, buttonTextStyle]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.button, buttonStyle]}
            >
              <Text style={[styles.toolbarButton, buttonTextStyle]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>

          <DateTimePicker
            value={tempValue}
            mode={mode}
            display={display}
            onChange={handlePickerChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={[styles.picker, pickerStyle]}
          />
        </View>
      </View>
    </Modal>
  );
};

export default CustomDateTimePicker;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: width * 0.85,
    maxHeight: height * 0.5,
    overflow: "hidden",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    backgroundColor: "#f8f8f8",
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toolbarButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  picker: {
    backgroundColor: "#fff",
  },
});
