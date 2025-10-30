import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Platform,
    StyleSheet,
    Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "@react-native-community/blur";

const { width, height } = Dimensions.get("window");

const CustomDateTimePicker = ({
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
    const [tempValue, setTempValue] = useState(value);

    const handlePickerChange = (event, selectedValue) => {
        if (selectedValue) {
            setTempValue(selectedValue);
            if (Platform.OS === "android") {
                // On Android, set value and close immediately
                onChange({ type: "set" }, selectedValue);
                setInternalVisible(false);
                onClose?.();
            }
        }
    };

    const handleConfirm = () => {
        onChange({ type: "set" }, tempValue);
        setInternalVisible(false);
        onClose?.();
    };

    const handleCancel = () => {
        setTempValue(value);
        setInternalVisible(false);
        onClose?.();
    };

    React.useEffect(() => {
        if (isVisible) {
            setInternalVisible(true);
            setTempValue(value);
        } else {
            setInternalVisible(false);
        }
    }, [isVisible, value]);

    return (

      Platform.OS === "ios" ?  <Modal
            visible={internalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View style={[styles.modalContainer]}>
                {useBlur && Platform.OS === "ios" ? (
                    <BlurView
                        style={StyleSheet.absoluteFill}
                        blurType="dark"
                        blurAmount={10}
                        reducedTransparencyFallbackColor={`rgba(0, 0, 0, ${backgroundOpacity})`}
                    />
                ) : null}
                {Platform.OS === "ios" ? (
                    <View style={[styles.pickerContainer, containerStyle]}>
                        <View style={[styles.toolbar, toolbarStyle]}>
                            <TouchableOpacity
                                onPress={handleCancel}
                                accessibilityLabel="Cancel selection"
                                accessibilityRole="button"
                                style={[styles.button, buttonStyle]}
                            >
                                <Text style={[styles.toolbarButton, buttonTextStyle]}>
                                    {cancelText}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleConfirm}
                                accessibilityLabel="Confirm selection"
                                accessibilityRole="button"
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
                            textColor="black"
                            style={[styles.picker, pickerStyle]}
                            display={display}
                            onChange={handlePickerChange}
                            minimumDate={minimumDate}
                            maximumDate={maximumDate}
                        />
                    </View>
                ) : (
                    <DateTimePicker
                        value={tempValue}
                        mode={mode}
                        textColor="black"
                        style={[styles.picker, pickerStyle]}
                        display={display}
                        onChange={handlePickerChange}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                    />
                )}
            </View>
        </Modal> : <DateTimePicker
                        value={tempValue}
                        mode={mode}
                        textColor="black"
                        style={[styles.picker, pickerStyle]}
                        display={display}
                        onChange={handlePickerChange}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                    />
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    pickerContainer: {
        backgroundColor: "#fff",
        borderRadius: 15,
        width: width * 0.8,
        maxHeight: height * 0.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        overflow: "hidden",
    },
    toolbar: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        backgroundColor: "#f9f9f9",
    },
    button: {
        padding: 5,
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

export default CustomDateTimePicker;