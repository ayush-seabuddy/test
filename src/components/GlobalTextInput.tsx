import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import Colors from "@/src/utils/Colors";

interface GlobalTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    secure?: boolean;
    containerStyle?: ViewStyle;
    inputWrapperStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    errorStyle?: TextStyle;
}

const GlobalTextInput: React.FC<GlobalTextInputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    secure,
    containerStyle,
    inputWrapperStyle,
    inputStyle,
    labelStyle,
    errorStyle,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

            <View style={[styles.inputWrapper, inputWrapperStyle]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    {...props}
                    style={[styles.input, inputStyle]}
                    placeholderTextColor={Colors.textPlaceholder}
                    secureTextEntry={secure && !showPassword}
                />

                {secure ? (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                            <Eye size={20} color={Colors.iconMuted} />
                        ) : (
                            <EyeOff size={20} color={Colors.iconMuted} />
                        )}
                    </TouchableOpacity>
                ) : rightIcon ? (
                    <View>{rightIcon}</View>
                ) : null}
            </View>

            {!!error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
        </View>
    );
};

export default GlobalTextInput;

const styles = StyleSheet.create({
    container: { marginVertical: 8 },
    label: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        marginBottom: 4,
        color: Colors.textPrimary,
        marginLeft: 6,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.inputBackground,
        borderRadius: 5,
        paddingHorizontal: 12,
        height: 50,
    },
    leftIcon: { marginRight: 16 },
    input: {
        flex: 1,
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: Colors.textPrimary,
    },
    errorText: {
        fontSize: 12,
        color: Colors.error,
        marginTop: 4,
        marginLeft: 6,
    },
});
